import { gameLog } from "../common/logger";
import { RoleInfo } from "./roleInfo";
import { svr_info } from "./svr_info";

export class Bag {
    private role: RoleInfo;
    private items: I_item[];
    private changed = false;

    constructor(role: RoleInfo, items: I_item[]) {
        this.role = role;
        this.items = items;
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

}


export interface I_item {
    i: number,
    id: number,
    num: number,
}

