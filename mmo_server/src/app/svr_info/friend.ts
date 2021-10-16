import { E_lock, RoleInfo } from "./roleInfo";
import { app, rpcErr } from "mydog";
import { cmd } from "../../config/cmd";
import { svr_info } from "./svr_info";
import { getInfoId } from "../util/gameUtil";
import { friendState, I_friendInfo_client, I_friendInfoChange } from "../common/someInterface";
import { createCountdown, removeFromArr } from "../util/util";
import { gameLog } from "../common/logger";

export const MaxFriendNum = 50;

export class Friend {
    private role: RoleInfo;
    private list: number[];
    private asklist: number[];
    constructor(role: RoleInfo, friends: { "list": number[], "asklist": number[] }) {
        this.role = role;
        this.list = friends.list;
        this.asklist = friends.asklist;
    }

    /**
     * 得到所有好友信息
     */
    getAllFriends(cb: (friends: I_friendInfo_client[]) => void) {

        let endArr: I_friendInfo_client[] = [];
        let countdown_all = createCountdown(2, () => {
            cb(endArr);
        });

        let countdown_list = createCountdown(this.list.length, () => {
            countdown_all.down();
        });
        for (let uid of this.list) {
            app.rpc(getInfoId(uid)).info.friend.getFriendInfo(uid, (err, friendInfo) => {
                countdown_list.down();
                if (err || !friendInfo) {
                    return;
                }
                friendInfo.state = friendState.friend;
                endArr.push(friendInfo)
            });
        }

        let countdown_asklist = createCountdown(this.asklist.length, () => {
            countdown_all.down();
        });
        for (let uid of this.list) {
            app.rpc(getInfoId(uid)).info.friend.getFriendInfo(uid, (err, friendInfo) => {
                countdown_asklist.down();
                if (err || !friendInfo) {
                    return;
                }
                friendInfo.state = friendState.ask;
                endArr.push(friendInfo)
            });
        }
    }

    /**
     * 请求添加好友
     */
    askFriend(msg: { "uid": number }, next: Function) {

        if (this.role.uid === msg.uid) {    //不得添加自己为好友
            return next({ "code": 1405 });
        }
        if (this.list.includes(msg.uid)) {  // 已经是好友
            return next({ "code": 1402 });
        }
        if (this.list.length >= MaxFriendNum) {     // 好友已满
            return next({ "code": 1403 });
        }
        if (this.role.getLock(E_lock.friend)) {
            return;
        }
        this.role.setLock(E_lock.friend, true);
        let myInfo = this.role.getFriendInfo(friendState.ask);
        app.rpc(getInfoId(msg.uid)).info.friend.askFriendTell(msg.uid, myInfo, (err, code) => {
            this.role.setLock(E_lock.friend, false);
            if (err) {
                return next({ "code": -2 });
            }
            next({ "code": code });
        });
    }

    /**
     * 请求添加好友消息
     */
    askFriendTell(info: I_friendInfo_client, cb: (err: number, code: number) => void) {
        if (this.list.includes(info.uid) || this.asklist.includes(info.uid)) {
            return cb(0, 0);
        }
        if (this.asklist.length >= MaxFriendNum) {
            return cb(0, 1404);
        }
        cb(0, 0);
        this.asklist.push(info.uid);
        let sql = "insert into friend(uid,uidF,state) values(?,?,?) on duplicate key update state=values(state)"
        svr_info.mysql.query(sql, [this.role.uid, info.uid, friendState.ask], (err, res) => {
            if (err) {
                removeFromArr(this.asklist, info.uid);
                gameLog.error(err);
                return;
            }
            this.role.getMsg(cmd.onAskFriend, { "friend": info });
        });
    }

    /**
     * 同意添加好友
     */
    agreeFriend(friendUid: number, next: Function) {
        if (!this.asklist.includes(friendUid)) {
            return;
        }
        if (this.list.length >= MaxFriendNum) {
            return next({ "code": 1403 });
        }
        if (this.role.getLock(E_lock.friend)) {
            return;
        }
        this.role.setLock(E_lock.friend, true);
        let msg = this.role.getFriendInfo(friendState.friend);
        app.rpc(getInfoId(friendUid)).info.friend.agreeFriendTell(friendUid, msg, (err, code, friendInfo) => {
            this.role.setLock(E_lock.friend, false);
            if (err) {
                return next({ "code": -2 });;
            }
            if (code !== 0) {
                return next({ "code": code });;
            }
            if (!friendInfo) {
                return next({ "code": -1 });;
            }

            this.list.push(friendUid);
            removeFromArr(this.asklist, friendUid);

            this.role.getMsg(cmd.onAddFriend, { "friend": friendInfo });

            let sql = "insert into friend(uid,uidF,state) values(?,?,?),(?,?,?) on duplicate key update state=values(state)";
            let meRole = this.role.role;
            svr_info.mysql.query(sql, [meRole.uid, friendUid, friendState.friend, friendUid, meRole.uid, friendState.friend], (err) => {
                if (err) {
                    gameLog.error(err);
                    return;
                }
            });

        });

    }


    /**
     * 同意添加好友消息
     */
    agreeFriendTell(info: I_friendInfo_client, cb: (err: rpcErr, code: number, info: I_friendInfo_client) => void) {
        if (this.list.length >= MaxFriendNum) {
            return cb(0, 1404, null as any);
        }
        if (!this.list.includes(info.uid)) {
            this.list.push(info.uid);
            removeFromArr(this.asklist, info.uid);
            this.role.getMsg(cmd.onAddFriend, { "friend": info });
        }
        let msg = this.role.getFriendInfo(friendState.friend);
        cb(0, 0, msg);
    }

    refuseFriend(friendUid: number) {
        if (!this.asklist.includes(friendUid)) {
            return;
        }
        removeFromArr(this.asklist, friendUid);
        let sql = "delete from friend where uid = ? and uidF = ? limit 1";
        svr_info.mysql.query(sql, [this.role.uid, friendUid], (err) => {
            if (err) {
                this.asklist.push(friendUid);
                gameLog.error(err);
            }
        });
    }

    delFriend(friendUid: number) {
        if (!this.list.includes(friendUid)) {
            return;
        }
        removeFromArr(this.list, friendUid);
        let sql = "delete from friend where (uid = ? and uidF = ?) or (uid = ? and uidF = ?) limit 2";
        svr_info.mysql.query(sql, [this.role.uid, friendUid, friendUid, this.role.uid], (err) => {
            if (err) {
                this.list.push(friendUid);
                gameLog.error(err);
                return;
            }
            this.role.getMsg(cmd.onDelFriend, { "uid": friendUid });
            app.rpc(getInfoId(friendUid)).info.friend.delFriendTell(friendUid, this.role.uid);
        });
    }

    delFriendTell(friendUid: number) {
        removeFromArr(this.list, friendUid);
        this.role.getMsg(cmd.onDelFriend, { "uid": friendUid });
    }

    /**
     * 信息改变，通知好友
     */
    changeInfo(info: I_friendInfoChange) {
        for (let uid of this.list) {
            app.rpc(getInfoId(uid)).info.friend.friendInfoChangeTell(uid, info);
        }
    }

    /**
     * 好友信息改变消息
     */
    friendInfoChangeTell(info: I_friendInfoChange) {
        this.role.getMsg(cmd.onFriendInfoChange, info);
    }
}

