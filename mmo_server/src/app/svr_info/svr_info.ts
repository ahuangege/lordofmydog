import { MysqlClient } from "../util/mysql";
import { RoleInfoMgr } from "./roleInfoMgr";


export let svr_info: {
    mysql: MysqlClient,
    roleInfoMgr: RoleInfoMgr,
} = {
    mysql: null as any,
    roleInfoMgr: null as any,
}
