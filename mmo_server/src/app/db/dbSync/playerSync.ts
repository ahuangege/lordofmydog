import { Bag } from "../../svr_info/bag";
import { Equipment } from "../../svr_info/equipment";
import { RoleInfo } from "../../svr_info/roleInfo";
import { MysqlClient } from "../../util/mysql";
import { Db_bag } from "../dbModel/bagTable";
import { Db_equipment } from "../dbModel/equipmentTable";
import { Db_role } from "../dbModel/roleTable";
import { dbTable } from "../dbTable";


export class PlayerSync {
    private mysql: MysqlClient;

    constructor(mysql: MysqlClient) {
        this.mysql = mysql;
    }

    async updateRole(uid: number, role: RoleInfo) {
        await this.mysql.update<Db_role>(dbTable.player, role.getSqlUpdateObj(), { "where": { uid }, "limit": 1 });
    }

    async updateBag(uid: number, bag: Bag) {
        await this.mysql.update<Db_bag>(dbTable.bag, bag.getSqlUpdateObj(), { "where": { uid }, "limit": 1 });
    }

    async updateEquipment(uid: number, equipment: Equipment) {
        await this.mysql.update<Db_equipment>(dbTable.equipment, equipment.getSqlUpdateObj(), { "where": { uid }, "limit": 1 });
    }
}