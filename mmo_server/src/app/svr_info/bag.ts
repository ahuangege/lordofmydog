import { cmd } from "../../config/cmd";
import { gameLog } from "../common/logger";
import { removeFromArr } from "../util/util";
import { RoleInfo } from "./roleInfo";
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

    addItem(item: I_item) {

    }

    addItems(items: I_item[]) {

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