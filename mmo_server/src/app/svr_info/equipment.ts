import { gameLog } from "../common/logger";
import { RoleInfo } from "./roleInfo";
import { svr_info } from "./svr_info";

export class Equipment {
    private role: RoleInfo;
    private equip: I_equipment;
    private changedKey: { [key in keyof I_equipment]?: boolean } = {};
    constructor(role: RoleInfo, equip: I_equipment) {
        this.role = role;
        this.equip = equip;
    }


    updateSql() {
        let updateArr: string[] = [];
        let key: keyof I_equipment;
        for (key in this.changedKey) {
            updateArr.push(key + "=" + this.equip[key]);
        }
        if (updateArr.length === 0) {
            return;
        }
        this.changedKey = {};
        let sql = `update equipment set ${updateArr.join(",")} where uid = ${this.role.uid} limit 1`;
        svr_info.mysql.query(sql, null, (err) => {
            err && gameLog.error(err);
        });

    }

}


export interface I_equipment {
    "uid": number,              // uid
    "weapon": number,           // 武器
    "armor_physical": number,   // 物理护甲
    "armor_magic": number,      // 魔法抗性
    "hp": number,               // 加血量上限
    "mp": number,               // 加蓝量上限
}

