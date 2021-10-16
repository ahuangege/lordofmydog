import { app, Application } from "mydog";
import { I_roleAllInfoClient, I_uidsid } from "../../../app/common/someInterface";
import { svr_info } from "../../../app/svr_info/svr_info";
import { randIntNum } from "../../../app/util/util";
import { cmd } from "../../../config/cmd";
import FriendRemote from "./friend";
import MapRemote from "./map";

declare global {
    interface Rpc {
        info: {
            main: Remote,
            friend: FriendRemote,
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
    enterServer(msg: I_uidsid, cb: (err: number, info: I_roleAllInfoClient) => void) {
        svr_info.roleInfoMgr.enterServer(msg, cb);
    }

    /**
     * 重连
     */
    reconnectEntry(uid: number, sid: string, token: number, cb: (err: number, info: I_roleAllInfoClient) => void) {
        svr_info.roleInfoMgr.reconnectEntry(uid, sid, token, cb);
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