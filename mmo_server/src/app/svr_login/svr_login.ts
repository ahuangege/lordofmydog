import { MysqlClient } from "../util/mysql";
import { LoginMgr } from "./loginMgr";


export let svr_login: {
    mysql: MysqlClient,
    loginMgr: LoginMgr,
} = {
    mysql: null as any,
    loginMgr: null as any,
}
