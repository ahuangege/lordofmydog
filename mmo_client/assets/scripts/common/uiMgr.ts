// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cfg_all } from "./configUtil";
import { SomeInfo } from "./someInfo";



const { ccclass, property } = cc._decorator;

@ccclass
export class UIMgr extends cc.Component {

    private static instance: UIMgr = null;

    onLoad() {
        UIMgr.instance = this;
    }

    /**
     * 加载ui界面
     * @param path 
     * @param cb 
     */
    static showPanel(path: string, cb?: (err: Error, node: cc.Node) => void) {
        cc.resources.load("uiPanel/" + path, (err, prefab: cc.Prefab) => {
            if (err || !cc.isValid(this)) {
                console.error(err);
                cb && cb(err, null);
                return;
            }
            let newNode = cc.instantiate(prefab);
            newNode.parent = UIMgr.instance.node;
            cb && cb(null, newNode);
        });
    }


    static showSomeInfo(info: string, showCloseBtn: boolean = false, yesCb?: () => void) {
        this.showPanel(uiPanel.someInfoPanel, (err, node) => {
            if (err) {
                return;
            }
            node.getComponent(SomeInfo).showInfo(info, showCloseBtn, yesCb);
        });
    }

    static showErrcode(code: number, showCloseBtn: boolean = false, yesCb?: () => void) {
        let one = cfg_all().errcode[code];
        if (one) {
            this.showSomeInfo(one.des, showCloseBtn, yesCb);
        } else {
            this.showSomeInfo("未知错误：" + code, showCloseBtn, yesCb);
        }
    }


    onDestroy() {
        UIMgr.instance = null;
    }
}

export const enum uiPanel {
    someInfoPanel = "someInfoPanel",
    loginPanel = "login/loginPanel",
    registerPanel = "login/registerPanel",
    createRole = "login/createRole",

    gameMain = "map/gameMainPanel",
    bagPanel = "map/bagPanel",
}