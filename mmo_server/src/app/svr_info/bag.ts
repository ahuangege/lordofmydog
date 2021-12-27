import { app } from "mydog";
import { cmd } from "../../config/cmd";
import { cfg_all } from "../common/configUtil";
import { gameLog } from "../common/logger";
import { removeFromArr } from "../util/util";
import { E_itemT, RoleInfo } from "./roleInfo";
import { svr_info } from "./svr_info";

export class Bag {
    private role: RoleInfo;
    private items: I_bagItem[];
    private changed = false;

    constructor(role: RoleInfo, items: I_bagItem[]) {
        this.role = role;
        this.items = items;
    }

    getBag() {
        return this.items;
    }

    updateSql() {
        if (this.changed) {
            this.changed = false;
            let sql = `update bag set items='${JSON.stringify(this.items)}' where uid = ${this.role.uid} limit 1`;
            svr_info.mysql.query(sql, null, (err) => {
                err && gameLog.error(err);
            });
        }
    }

    private addToSqlPool() {
        this.changed = true;
        this.role.addToSqlPool();
    }

    getItemByI(index: number) {
        for (let one of this.items) {
            if (one.i === index) {
                return one;
            }
        }
        return null;
    }

    getItem(id: number) {
        for (let one of this.items) {
            if (one.id === id) {
                return one;
            }
        }
        return null;
    }

    getEmptyIndex() {
        let index = -1;
        for (let i = 0; i < 16; i++) {
            if (!this.getItemByI(i)) {
                index = i;
                break;
            }
        }
        return index;
    }

    addItem(item: I_item) {
        if (cfg_all().item[item.id].type == E_itemT.gold) {
            this.role.addGold(item.num * cfg_all().item[item.id].num);
            return;
        }
        let tmpItem = this.getItem(item.id);
        if (tmpItem) {
            tmpItem.num += item.num;
        } else {
            let tmpI = this.getEmptyIndex();
            if (tmpI !== -1) {
                tmpItem = { "i": tmpI, "id": item.id, "num": item.num };
                this.items.push(tmpItem);
            } else {
                return;
            }
        }
        this.onItemChanged([tmpItem]);
        this.addToSqlPool();
    }

    addItems(items: I_item[]) {
        let changedArr: I_bagItem[] = [];
        for (let item of items) {
            if (cfg_all().item[item.id].type == E_itemT.gold) {
                this.role.addGold(item.num * cfg_all().item[item.id].num);
                continue;
            }
            let tmpItem = this.getItem(item.id);
            if (tmpItem) {
                tmpItem.num += item.num;
                changedArr.push(tmpItem);
            } else {
                let tmpI = this.getEmptyIndex();
                if (tmpI !== -1) {
                    tmpItem = { "i": tmpI, "id": item.id, "num": item.num };
                    this.items.push(tmpItem);
                    changedArr.push(tmpItem);
                }
            }
        }
        if (changedArr.length) {
            this.onItemChanged(changedArr);
            this.addToSqlPool();
        }
    }

    private onItemChanged(arr: I_bagItem[]) {
        this.role.getMsg(cmd.onItemChanged, arr);
    }

    /** 删除 */
    delItem(index: number) {
        let item = this.getItemByI(index);
        if (!item) {
            return;
        }
        removeFromArr(this.items, item);
        item.num = 0;
        this.onItemChanged([item]);
        this.addToSqlPool();
    }
    /** 丢地上 */
    dropItem(index: number) {
        let item = this.getItemByI(index);
        if (!item) {
            return;
        }
        removeFromArr(this.items, item);
        let num = item.num;
        item.num = 0;
        this.onItemChanged([item]);
        this.addToSqlPool();

        app.rpc(this.role.roleMem.mapSvr).map.main.dropItem(this.role.roleMem.mapIndex, this.role.uid, item.id, num);
    }

    /** 道具换位置 */
    changePos(msg: { "index1": number, "index2": number }) {
        msg.index1 = Math.floor(msg.index1) || 0;
        msg.index2 = Math.floor(msg.index2) || 0;
        if (msg.index1 === msg.index2) {
            return;
        }
        if (msg.index2 > 15 || msg.index2 < 0) {   // 背包只有16个格子
            return;
        }
        let item1 = this.getItemByI(msg.index1);
        if (!item1) {
            return;
        }
        let item2 = this.getItemByI(msg.index2);
        if (item2) {
            item1.i = msg.index2;
            item2.i = msg.index1;
            this.onItemChanged([item1, item2]);
        } else {
            item1.i = msg.index2;
            this.onItemChanged([{ "i": msg.index1, "id": item1.id, "num": 0 }, item1]);
        }
        this.addToSqlPool();
    }

    /** 装备道具 */
    equipItem(msg: { index: number, t: E_itemT }) {
        let item = this.getItemByI(msg.index);
        if (!item) {
            return;
        }
        msg.t = Math.floor(msg.t) || 0;
        let cfg = cfg_all().item[item.id];
        if (cfg.type !== msg.t) {
            return;
        }
        if (cfg.type >= E_itemT.weapon && cfg.type <= E_itemT.mp_add) {   // 装备栏
            let equip = this.role.equip.equip;
            let oldId = 0;
            if (cfg.type === E_itemT.weapon) {
                oldId = equip.weapon;
                equip.weapon = item.id;
                this.role.equip.changeSqlKey("weapon");
            } else if (cfg.type === E_itemT.armor_physical) {
                oldId = equip.armor_physical;
                equip.armor_physical = item.id;
                this.role.equip.changeSqlKey("armor_physical");
            } else if (cfg.type === E_itemT.armor_magic) {
                oldId = equip.armor_magic;
                equip.armor_magic = item.id;
                this.role.equip.changeSqlKey("armor_magic");
            } else if (cfg.type === E_itemT.hp_add) {
                oldId = equip.hp_add;
                equip.hp_add = item.id;
                this.role.equip.changeSqlKey("hp_add");
            } else if (cfg.type === E_itemT.mp_add) {
                oldId = equip.mp_add;
                equip.mp_add = item.id;
                this.role.equip.changeSqlKey("mp_add");
            }
            item.num--;
            if (item.num <= 0) {
                removeFromArr(this.items, item);
            }
            this.addToSqlPool();
            let changedArr: I_bagItem[] = [item];
            if (oldId !== 0) {
                let tmpItem = this.getItem(oldId);
                if (tmpItem) {
                    tmpItem.num += 1;
                    changedArr.push(tmpItem);
                } else {
                    let tmpI = 0;
                    if (item.num <= 0) {
                        tmpI = item.i;
                    } else {
                        tmpI = this.getEmptyIndex();
                    }
                    if (tmpI !== -1) {
                        tmpItem = { "i": tmpI, "id": oldId, "num": 1 };
                        this.items.push(tmpItem);
                        changedArr.push(tmpItem);
                    }
                }
            }
            this.onItemChanged(changedArr);
            let equipChanged = { "t": cfg.type, "id": item.id };
            this.role.equip.onEquipChanged(equipChanged);
            app.rpc(this.role.roleMem.mapSvr).map.main.onEquipChanged(this.role.roleMem.mapIndex, this.role.uid, equipChanged);
            return;
        }

        if (cfg.type === E_itemT.hp || cfg.type === E_itemT.mp) { // 快速加血加蓝栏
            let oldPos: I_item = null as any;
            if (cfg.type === E_itemT.hp) {
                oldPos = this.role.role.hpPos;
                this.role.changeSqlKey("hpPos");
            } else {
                oldPos = this.role.role.mpPos;
                this.role.changeSqlKey("mpPos");
            }
            let changedArr: I_bagItem[] = [];
            let itemNum = item.num;
            item.num = 0;
            removeFromArr(this.items, item);
            changedArr.push(item);

            if (oldPos.id === item.id) {
                oldPos.num += itemNum;
                this.role.getMsg(cmd.onHpMpPosChanged, { "t": cfg.type, "id": oldPos.id, "num": oldPos.num });
            } else {
                let newPos: I_item = { "id": item.id, "num": itemNum };
                if (cfg.type === E_itemT.hp) {
                    this.role.role.hpPos = newPos;
                } else {
                    this.role.role.mpPos = newPos;
                }
                this.role.getMsg(cmd.onHpMpPosChanged, { "t": cfg.type, "id": newPos.id, "num": newPos.num });

                if (oldPos.id !== 0) {
                    let tmpItem = this.getItem(oldPos.id);
                    if (tmpItem) {
                        tmpItem.num += oldPos.num;
                        changedArr.push(tmpItem);
                    } else {
                        tmpItem = { "i": item.i, "id": oldPos.id, "num": oldPos.num };
                        this.items.push(tmpItem);
                        changedArr.push(tmpItem);
                    }
                }
            }
            this.onItemChanged(changedArr);
            this.addToSqlPool();
            return;
        }
    }

    /** 使用快速加血加蓝 */
    useHpMpAdd(isHp: boolean) {
        let used: I_item = null as any;
        if (isHp) {
            used = this.role.role.hpPos;
        } else {
            used = this.role.role.mpPos;
        }
        if (!used.id) {
            return;
        }
        let itemId = used.id;
        used.num--;
        if (used.num <= 0) {
            used.id = 0;
            used.num = 0;
        }
        this.role.getMsg(cmd.onHpMpPosChanged, { "t": isHp ? E_itemT.hp : E_itemT.mp, "id": used.id, "num": used.num });
        if (isHp) {
            this.role.changeSqlKey("hpPos");
        } else {
            this.role.changeSqlKey("mpPos");
        }
        app.rpc(this.role.roleMem.mapSvr).map.main.useHpMpAdd(this.role.roleMem.mapIndex, this.role.uid, itemId);
    }
}


export interface I_bagItem {
    i: number,
    id: number,
    num: number,
}

export interface I_item {
    id: number,
    num: number,
}