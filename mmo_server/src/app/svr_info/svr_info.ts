import { SyncUtil } from "sync-util";
import { MysqlClient } from "../util/mysql";
import { RoleInfoMgr } from "./roleInfoMgr";
import { Dic } from "../util/util";
import { PlayerSync } from "../db/dbSync/playerSync";


export let svr_info: {
    mysql: MysqlClient,
    roleInfoMgr: RoleInfoMgr,
    syncUtil: SyncUtil<I_syncUtil_info>
} = {
    mysql: null as any,
    roleInfoMgr: null as any,
    syncUtil: null as any,
}


export interface I_syncUtil_info extends Dic<Dic<any>> {
    "playerSync": PlayerSync
}