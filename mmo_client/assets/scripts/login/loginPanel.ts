// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Game } from "../common/game";
import { httpReq } from "../common/httpReq";
import { UIMgr, uiPanel } from "../common/uiMgr";
import { LoginMain } from "./loginMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    usernameInput: cc.EditBox = null;
    @property(cc.EditBox)
    passwordInput: cc.EditBox = null;

    private isLogining = false;

    start() {
        let username = cc.sys.localStorage.getItem("username");
        if (username) {
            this.usernameInput.string = username;
            this.passwordInput.string = cc.sys.localStorage.getItem("password");
        }
    }

    btn_register() {
        if (this.isLogining) {
            return;
        }
        UIMgr.showPanel(uiPanel.registerPanel);
    }

    btn_login() {
        if (this.isLogining) {
            return;
        }
        this.isLogining = true;
        let url = "http://" + LoginMain.instance.loginHost + ":" + LoginMain.instance.loginPort + "/client/login/login";
        httpReq({ "url": url, "msg": { "username": this.usernameInput.string, "password": this.passwordInput.string } }, (err, data: I_loginBack) => {
            this.isLogining = false;
            if (err) {
                UIMgr.showSomeInfo("连不上服务器");
                return;
            }
            if (data.code !== 0) {
                UIMgr.showErrcode(data.code);
                return;
            }
            Game.loginInfo = data;
            cc.sys.localStorage.setItem("username", this.usernameInput.string);
            cc.sys.localStorage.setItem("password", this.passwordInput.string);
            cc.director.loadScene("rolelist");
        });
    }

}


export interface I_loginBack {
    "code": number,
    "host": string,
    "port": number,
    "accId": number,
    "accToken": number,
}