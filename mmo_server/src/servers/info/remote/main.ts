import { app, Application } from "mydog";
import { I_roleAllInfoClient, I_uidsid } from "../../../app/common/someInterface";
import { svr_info } from "../../../app/svr_info/svr_info";
import { randIntNum } from "../../../app/util/util";
import { cmd } from "../../../config/cmd";
import MapRemote from "./map";

declare global {
    interface Rpc {
        info: {
            main: Remote,
            map: MapRemote,
        }
    }
}

export default class Remote {

    constructor(app: Application) {
    }


    /**
     * 进入游戏
     */
    async enterServer(msg: I_uidsid) {
        return await svr_info.roleInfoMgr.enterServer(msg);
    }

    /**
     * 重连
     */
    async reconnectEntry(uid: number, sid: string, token: number) {
        return await svr_info.roleInfoMgr.reconnectEntry(uid, sid, token);
    }

    /**
     * 掉线
     */
    offline(uid: number) {
        let role = svr_info.roleInfoMgr.getRole(uid);
        if (role) {
            role.offline();
        }
    }


    /**
     * 给玩家发送消息
     */
    sendMsgToOne(uid: number, route: cmd, msg: any) {
        let role = svr_info.roleInfoMgr.getRole(uid);
        if (role) {
            role.getMsg(route, msg);
        }
    }

    loginResetToken(uid: number) {
        let role = svr_info.roleInfoMgr.getRole(uid);
        if (role) {
            role.changeRoleMem({ "token": randIntNum(1000000) }); // 修改token，防止旧客户端重连
        }
    }

}