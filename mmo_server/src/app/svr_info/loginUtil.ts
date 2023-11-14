import { gameLog } from "../common/logger";
import { I_roleAllInfo } from "../common/someInterface";
import { Db_bag, I_bagItem } from "../db/dbModel/bagTable";
import { Db_equipment } from "../db/dbModel/equipmentTable";
import { Db_role } from "../db/dbModel/roleTable";
import { dbTable } from "../db/dbTable";
import { svr_info } from "./svr_info";


/**
 * 登录时的处理
 */
export class LoginUtil {
    constructor() {
    }

    async getAllRoleInfo(uid: number): Promise<I_roleAllInfo> {
        const role = await this.getRoleInfo(uid);
        if (!role) {
            return { "code": 1 } as any;
        }
        const bag = await this.getBag(uid);
        const equipment = await this.getEquip(uid);
        return { "code": 0, role, bag, equipment };
    }


    private async getRoleInfo(uid: number): Promise<Db_role> {
        const res = await svr_info.mysql.select<Db_role>(dbTable.player, "*", { "where": { "uid": uid }, "limit": 1 });
        return res[0];
    }

    private async getBag(uid: number): Promise<Db_bag> {
        const res = await svr_info.mysql.select<Db_bag>(dbTable.bag, "*", { "where": { "uid": uid }, "limit": 1 });
        if (res.length) {
            return res[0];
        }
        let initItems: I_bagItem[] = [
            { "i": 0, "id": 1101, "num": 1 },
            { "i": 1, "id": 1102, "num": 2 },
            { "i": 2, "id": 1201, "num": 2 }
        ];
        let dbBag = new Db_bag();
        dbBag.uid = uid;
        dbBag.items = initItems;
        await svr_info.mysql.insert<Db_bag>(dbTable.bag, dbBag);
        return dbBag;
    }

    private async getEquip(uid: number): Promise<Db_equipment> {
        const res = await svr_info.mysql.select<Db_equipment>(dbTable.equipment, "*", { "where": { "uid": uid }, "limit": 1 });
        if (res.length) {
            return res[0];
        }
        let dbEquip = new Db_equipment();
        dbEquip.uid = uid;

        await svr_info.mysql.insert<Db_equipment>(dbTable.equipment, dbEquip);
        return dbEquip;
    }

}