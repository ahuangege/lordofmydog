import { Application, rpcErr } from "mydog";
import { svr_info } from "../../../app/svr_info/svr_info";
import { nowMs } from "../../../app/common/time";
import { cmd } from "../../../config/cmd";
import { friendCacheDelTime, RoleInfoMgr } from "../../../app/svr_info/roleInfoMgr";
import { friendState, I_friendInfoChange, I_friendInfo_client } from "../../../app/common/someInterface";
import { MaxFriendNum } from "../../../app/svr_info/friend";
import { gameLog } from "../../../app/common/logger";

export default class FriendRemote {
    private app: Application;
    private roleInfoMgr: RoleInfoMgr;
    constructor(app: Application) {
        this.app = app;
        this.roleInfoMgr = svr_info.roleInfoMgr;
    }

    /**
     * 玩家登录时，获取好友信息
     */
    getFriendInfo(uid: number, cb: (err: rpcErr, info: I_friendInfo_client) => void) {
        let role = this.roleInfoMgr.getRole(uid);
        if (role) {
            return cb(0, role.getFriendInfo(friendState.ask));
        }
        let cacheInfo = this.roleInfoMgr.offlineFriendCache[uid];
        if (cacheInfo) {
            cacheInfo.delTime = nowMs() + friendCacheDelTime;
            return cb(0, {
                "uid": uid,
                "nickname": cacheInfo.nickname,
                "state": friendState.ask
            });
        }
        this.roleInfoMgr.loginUtil.getFriendInfoFromDb(uid, (friendInfo) => {
            if (!friendInfo) {
                return cb(0, null as any);
            }
            friendInfo.delTime = nowMs() + friendCacheDelTime;
            if (!this.roleInfoMgr.getRole(uid)) {
                this.roleInfoMgr.offlineFriendCache[uid] = friendInfo;
            }
            return cb(0, {
                "uid": uid,
                "nickname": friendInfo.nickname,
                "state": 0,
            });
        });
    }


    /**
     * 好友申请的通知
     */
    askFriendTell(uid: number, info: I_friendInfo_client, cb: (err: number, code: number) => void) {
        let role = this.roleInfoMgr.getRole(uid);
        if (role) {
            role.friend.askFriendTell(info, cb);
            return;
        }
        svr_info.mysql.query("select uidF,state from friend where uid=? limit 1", [uid], (err, res: { "uidF": number, "state": friendState }[]) => {
            if (err) {
                return cb(0, -1);
            }
            let num = 0;
            let has = false;
            for (let one of res) {
                if (one.uidF === info.uid) {
                    has = true;
                    break;
                }
                if (one.state === friendState.ask) {
                    num++;
                }
            }
            if (has) {
                return cb(0, 0);
            }
            if (num >= MaxFriendNum) {
                return cb(0, 1404);
            }
            cb(0, 0);
            let sql = "insert into friend(uid,uidF,state) values(?,?,?) on duplicate key update state=values(state)"
            svr_info.mysql.query(sql, [uid, info.uid, friendState.ask], (err) => {
                if (err) {
                    gameLog.error(err);
                }
            });
        });
    }

    /**
     * 同意好友的通知
     */
    agreeFriendTell(uid: number, info: I_friendInfo_client, cb: (err: rpcErr, code: number, info: I_friendInfo_client) => void) {
        let role = this.roleInfoMgr.getRole(uid);
        if (role) {
            role.friend.agreeFriendTell(info, cb);
            return;
        }

        let self = this;
        svr_info.mysql.query("select uidF,state from friend where uid=? limit 1", [uid], (err, res: { "uidF": number, "state": friendState }[]) => {
            if (err) {
                return cb(0, -1, null as any);
            }
            let num = 0;
            let isFriend = false;
            for (let one of res) {
                if (one.uidF === info.uid && one.state === friendState.friend) {
                    isFriend = true;
                    break;
                }
                if (one.state === friendState.friend) {
                    num++;
                }
            }
            if (isFriend) {
                return okFunc();
            }
            if (num >= MaxFriendNum) {
                return cb(0, 1404, null as any);
            }
            okFunc();
        });

        function okFunc() {
            let cacheInfo = self.roleInfoMgr.offlineFriendCache[uid];
            if (cacheInfo) {
                cacheInfo.delTime = nowMs() + friendCacheDelTime;
                return cb(0, 0, { "state": friendState.friend, "uid": uid, "nickname": cacheInfo.nickname });
            }
            self.roleInfoMgr.loginUtil.getFriendInfoFromDb(uid, (friendInfo) => {
                if (!friendInfo) {
                    return cb(0, -1, null as any);
                }
                friendInfo.delTime = nowMs() + friendCacheDelTime;
                if (!self.roleInfoMgr.getRole(uid)) {
                    self.roleInfoMgr.offlineFriendCache[uid] = friendInfo;
                }
                return cb(0, 0, {
                    "uid": uid,
                    "nickname": friendInfo.nickname,
                    "state": friendState.friend,
                });
            });
        }


    }

    delFriendTell(uid: number, fUid: number) {
        let role = this.roleInfoMgr.getRole(uid);
        if (role) {
            role.friend.delFriendTell(fUid);
        }
    }


    /**
     * 好友信息改变
     */
    friendInfoChangeTell(uid: number, info: I_friendInfoChange) {
        let role = this.roleInfoMgr.getRole(uid);
        if (role) {
            role.friend.friendInfoChangeTell(info);
        }
    }
}

