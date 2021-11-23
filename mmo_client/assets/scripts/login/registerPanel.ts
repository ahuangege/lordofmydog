// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Game } from "../common/game";
import { httpReq } from "../common/httpReq";
import { UIMgr } from "../common/uiMgr";
import { LoginMain } from "./loginMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.EditBox)
    usernameInput: cc.EditBox = null;
    @property(cc.EditBox)
    passwordInput: cc.EditBox = null;
    @property(cc.EditBox)
    passwordAgainInput: cc.EditBox = null;

    private isRegistering = false;

    btn_back() {
        if (this.isRegistering) {
            return;
        }
        this.node.destroy();
    }

    btn_register() {
        if (this.isRegistering) {
            return;
        }
        if (this.passwordInput.string !== this.passwordAgainInput.string) {
            UIMgr.showSomeInfo("两次密码不一致");
            return;
        }
        this.isRegistering = true;
        let url = "http://" + LoginMain.instance.loginHost + ":" + LoginMain.instance.loginPort + "/client/login/register";
        httpReq({ "url": url, "msg": { "username": this.usernameInput.string, "password": this.passwordInput.string } }, (err, data) => {
            this.isRegistering = false;
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
