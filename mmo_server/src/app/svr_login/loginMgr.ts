import { Application, ServerInfo } from "mydog";
import { serverType } from "../common/someConfig";
import { nowMs, nowSec } from "../common/time";

export class LoginMgr {
    public app: Application;
    private userTokens: { [accId: number]: I_userToken } = {};
    minSvr: ServerInfo;
    constructor(app: Application) {
        this.app = app;
        this.minSvr = app.serversConfig[serverType.connector][0];
        this.minSvr.userNum = 0;
        setInterval(this.rpcGetUserNum.bind(this), 5000);
        setInterval(this.resetMinSvr.bind(this), 500);
        setInterval(this.clearToken.bind(this), 1 * 3600 * 1000);
    }


    private rpcGetUserNum() {
        let svrs = this.app.getServersByType(serverType.connector);
        for (let one of svrs) {
            this.app.rpc(one.id).connector.main.getClientNum(function (err, num) {
                if (err) {
                    return;
                }
                one.userNum = num;
            });
        }
    }

    private resetMinSvr() {
        let svrs = this.app.getServersByType(serverType.connector);
        let minSvr = svrs[0];
        if (!minSvr) {
            return;
        }
        minSvr.userNum = minSvr.userNum || 0;
        for (let one of svrs) {
            one.userNum = one.userNum || 0;
            if (one.userNum < minSvr.userNum) {
                minSvr = one;
            }
        }
        this.minSvr = minSvr;
    }


    private clearToken() {
        let now = nowSec();
        for (let accId in this.userTokens) {
            if (this.userTokens[accId].time < now) {
                delete this.userTokens[accId];
            }
        }
    }

    /**
     * 设置token
     */
    setUserToken(accId: number, token: number) {
        this.userTokens[accId] = { "token": token, "time": nowSec() + 24 * 3600 };
    }

    /**
     * 验证token
     */
    isTokenOk(accId: number, token: number): boolean {
        let one = this.userTokens[accId];
        if (one) {
            return one.token === token;
        } else {
            return false;
        }
    }


}


export interface I_userToken {
    token: number,
    time: number,
}

