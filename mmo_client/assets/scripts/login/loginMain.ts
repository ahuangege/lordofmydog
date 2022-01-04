// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { initConfig } from "../common/configUtil";
import { Game } from "../common/game";
import { UIMgr, uiPanel } from "../common/uiMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class LoginMain extends cc.Component {
    static instance: LoginMain = null;

    @property
    loginHost: string = "127.0.0.1";
    @property
    loginPort: number = 5101;
    @property(cc.Boolean)
    isHttps: boolean = false;

    onLoad() {
        LoginMain.instance = this;
    }

    start() {
        initConfig(() => {
            Game.isHttps = this.isHttps;
            UIMgr.showPanel(uiPanel.loginPanel);
        });
    }

    // update (dt) {}

    onDestroy() {
        LoginMain.instance = null;
    }
}
