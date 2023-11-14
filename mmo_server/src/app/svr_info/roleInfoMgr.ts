import { Application } from "mydog";
import { gameLog } from "../common/logger";
import { I_roleAllInfoClient, I_uidsid } from "../common/someInterface";
import { nowMs } from "../common/time";
import { Dic, randIntNum, removeFromArr } from "../util/util";
import { LoginUtil } from "./loginUtil";
import { RoleInfo } from "./roleInfo";
import { svr_info } from "./svr_info";


export class RoleInfoMgr {
    private app: Application;
    public loginUtil: LoginUtil;                        // 登陆 util
    private roles: Dic<RoleInfo> = {};    // 所有玩家数据

    constructor(app: Application) {
        this.app = app;
        this.loginUtil = new LoginUtil();
        setInterval(this.check_delRole.bind(this), 3600 * 1000);
    }

    /**
     * 玩家登录游戏
     * @param uid 
     */
    async enterServer(msg: I_uidsid): Promise<I_roleAllInfoClient> {
        let role = this.roles[msg.uid];
        if (!role) {
            const allInfo = await this.loginUtil.getAllRoleInfo(msg.uid);
            if (allInfo.code) {
                return { "code": allInfo.code } as any;
            }
            if (this.roles[msg.uid]) {
                return { "code": 1 } as any;
            }
            role = new RoleInfo(allInfo);
            this.roles[msg.uid] = role;
        }

        role.changeRoleMem({ "token": randIntNum(1000000) });
        return await role.entryServerLogic(msg.sid);
    }

    /**
     * 重连
     */
    async reconnectEntry(uid: number, sid: string, token: number): Promise<I_roleAllInfoClient> {
        let role = this.roles[uid];
        if (!role) {
            return { "code": 1 } as any;
        }
        if (role.roleMem.token !== token) {
            return { "code": 10021 } as any;
        }
        if (role.sid) {
            return { "code": 1 } as any;
        }

        role.changeRoleMem({ "token": randIntNum(1000000) });
        return await role.entryServerLogic(sid);
    }


    // 检测过期玩家，删除缓存数据
    private check_delRole() {
        let one: RoleInfo;
        let nowTime = nowMs();
        for (let uid in this.roles) {
            one = this.roles[uid];
            if (one.delThisTime !== 0 && nowTime > one.delThisTime) {
                this.delRole(one.uid);
            }
        }
    }

    private delRole(uid: number) {
        const role = this.roles[uid];
        if (!role) {
            return;
        }
        delete this.roles[uid];
        svr_info.syncUtil.saveUid(uid);
    }

    /**
     * 获取玩家信息
     */
    getRole(uid: number) {
        return this.roles[uid];
    }
}

