import { cmd } from "../../config/cmd";
import { gameLog } from "../common/logger";
import { Db_equipment } from "../db/dbModel/equipmentTable";
import { getUpdateObj } from "../util/gameUtil";
import { E_itemT, RoleInfo } from "./roleInfo";
import { svr_info } from "./svr_info";

export class Equipment {
    private role: RoleInfo;
    public equip: Db_equipment;
    private changedKey: { [key in keyof Db_equipment]?: boolean } = {};
    private isInSql = false;
    constructor(role: RoleInfo, equip: Db_equipment) {
        this.role = role;
        this.equip = equip;
    }

    public getSqlUpdateObj() {
        let updateObj: Partial<Db_equipment> = getUpdateObj(this.equip, this.changedKey);
        this.changedKey = {};
        this.isInSql = false;
        return updateObj;
    }

    private addToSqlPool() {
        if (!this.isInSql) {
            this.isInSql = true;
            svr_info.syncUtil.sync.playerSync.updateEquipment(this.role.uid, this);
        }
    }
    changeSqlKey(key: keyof Db_equipment) {
        if (!this.changedKey[key]) {
            this.changedKey[key] = true;
            this.addToSqlPool();
        }
    }

    onEquipChanged(msg: { "t": E_itemT, "id": number }) {
        this.role.getMsg(cmd.onEquipChanged, msg);
    }

    delEquip(t: E_itemT) {
        if (t === E_itemT.weapon) {
            this.equip.weapon = 0;
            this.role.equip.changeSqlKey("weapon");
        } else if (t === E_itemT.armor_physical) {
            this.equip.armor_physical = 0;
            this.role.equip.changeSqlKey("armor_physical");
        } else if (t === E_itemT.armor_magic) {
            this.equip.armor_magic = 0;
            this.role.equip.changeSqlKey("armor_magic");
        } else if (t === E_itemT.hp_add) {
            this.equip.hp_add = 0;
            this.role.equip.changeSqlKey("hp_add");
        } else if (t === E_itemT.mp_add) {
            this.equip.mp_add = 0;
            this.role.equip.changeSqlKey("mp_add");
        }
        this.onEquipChanged({ "t": t, "id": 0 })
    }
}
