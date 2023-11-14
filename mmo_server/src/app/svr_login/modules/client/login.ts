
import { svr_login } from "../../svr_login";
import { gameLog } from "../../../common/logger";
import { nowMs, nowStr } from "../../../common/time";
import { md5 } from "../../../util/util";
import { constKey } from "../../../common/someConfig";
import { getCharLen } from "../../../util/gameUtil";
import { Db_account } from "../../../db/dbModel/accountTable";
import { dbTable } from "../../../db/dbTable";

export default class Handler {


    /**
     * 注册
     */
    async register(msg: { "username": string, "password": string }, next: (data: any) => void) {
        if (typeof msg.username !== "string") {
            return next({ "code": 1 });
        }
        if (typeof msg.password !== "string") {
            return next({ "code": 1 });
        }

        let allLen = 0;
        for (let i = 0; i < msg.username.length; i++) {
            let len = getCharLen(msg.username.charCodeAt(i));
            if (len === 2) {
                return next({ "code": 10002 });
            }
            allLen += len;
        }
        if (allLen < 5 || allLen > 15) {
            next({ "code": 10001 });
            return;
        }

        allLen = 0;
        for (let i = 0; i < msg.password.length; i++) {
            let len = getCharLen(msg.password.charCodeAt(i));
            if (len === 2) {
                return next({ "code": 10004 });
            }
            allLen += len;
        }
        if (allLen < 5 || allLen > 15) {
            next({ "code": 10003 });
            return;
        }


        let account = new Db_account();
        account.username = msg.username;
        account.password = md5(msg.password);
        delete (account as any).id;

        try {
            const res = await svr_login.mysql.insert<Db_account>(dbTable.account, account);
            this.getSuccessData({
                "accId": res.insertId,
                "next": next
            });

        } catch (e: any) {
            if (e?.errno === constKey.duplicateKey) {
                next({ "code": 10005 });
            } else {
                gameLog.error(e);
                next({ "code": 1 });
            }
        }

    }


    /**
     * 登录
     * @param msg 
     * @param next 
     */
    async login(msg: { "username": string, "password": string }, next: (data: any) => void) {
        if (typeof msg.username !== "string") {
            return next({ "code": 1 });
        }
        if (typeof msg.password !== "string") {
            return next({ "code": 1 });
        }

        let allLen = 0;
        for (let i = 0; i < msg.username.length; i++) {
            let len = getCharLen(msg.username.charCodeAt(i));
            if (len === 2) {
                return next({ "code": 10002 });
            }
            allLen += len;
        }
        if (allLen < 5 || allLen > 15) {
            next({ "code": 10001 });
            return;
        }

        allLen = 0;
        for (let i = 0; i < msg.password.length; i++) {
            let len = getCharLen(msg.password.charCodeAt(i));
            if (len === 2) {
                return next({ "code": 10004 });
            }
            allLen += len;
        }
        if (allLen < 5 || allLen > 15) {
            next({ "code": 10003 });
            return;
        }

        const users = await svr_login.mysql.select<Db_account>(dbTable.account, "*", { "where": { "username": msg.username }, "limit": 1 });
        if (users.length === 0) { // 不存在
            next({ "code": 10006 });
            return;
        }

        let user = users[0];
        if (user.password !== md5(msg.password)) {
            return next({ "code": 10007 });
        }

        this.getSuccessData({
            "accId": user.id,
            "next": next
        });
    }

    private getSuccessData(info: { "accId": number, "next": Function }) {
        let token = Math.floor(Math.random() * 10000000);
        let minSvr = svr_login.loginMgr.minSvr;

        let data = {
            "code": 0,
            "host": minSvr.clientHost,
            "port": minSvr.clientPort,
            "accId": info.accId,
            "accToken": token,
        }
        info.next(data);

        minSvr.userNum += 1;
        svr_login.loginMgr.setUserToken(info.accId, token);
    }



}

