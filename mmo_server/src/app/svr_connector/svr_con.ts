import { MysqlClient } from "../util/mysql";
import { ConMgr } from "./conMgr";


export let svr_con: {
    mysql: MysqlClient,
    conMgr: ConMgr,
} = {
    mysql: null as any,
    conMgr: null as any,
}
