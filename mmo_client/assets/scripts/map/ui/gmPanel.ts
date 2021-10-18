// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { network } from "../../common/network";

const { ccclass, property } = cc._decorator;

@ccclass
export class GmPanel extends cc.Component {

    static instance: GmPanel = null;
    @property(cc.EditBox)
    private edit: cc.EditBox = null;
    onLoad() {
        GmPanel.instance = this;
    }

    btn_commit() {
        let str = this.edit.string.trim();
        if (!str) {
            return;
        }
        network.sendMsg(cmd.info_main_gmCommit, { "str": str });
    }

    btn_close() {
        this.node.destroy();
    }

    onDestroy() {
        GmPanel.instance = null;
    }

}
