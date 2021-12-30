// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Dic } from "../map/mapMain";
import { removeFromArr } from "../util/gameUtil";
import { cfg_all } from "./configUtil";
import { SomeInfo } from "./someInfo";
import { TileInfo } from "./tileInfo";



const { ccclass, property } = cc._decorator;

@ccclass
export class UIMgr extends cc.Component {

    public static instance: UIMgr = null;
    private tileNodeArr: cc.Node[] = [];

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


    static showSomeInfo(info: string, showCloseBtn: boolean = true, yesCb?: () => void) {
        this.showPanel(uiPanel.someInfoPanel, (err, node) => {
            if (err) {
                return;
            }
            node.getComponent(SomeInfo).showInfo(info, showCloseBtn, yesCb);
        });
    }

    static showErrcode(code: number, showCloseBtn: boolean = true, yesCb?: () => void) {
        let one = cfg_all().errcode[code];
        if (one) {
            this.showSomeInfo(one.des, showCloseBtn, yesCb);
        } else {
            this.showSomeInfo("未知错误：" + code, showCloseBtn, yesCb);
        }
    }

    static showTileInfo(info: string) {
        this.showPanel(uiPanel.tileInfo, (err, node) => {
            if (err) {
                return;
            }
            node.getComponent(TileInfo).init(info);
            let nodeArr = UIMgr.instance.tileNodeArr;
            nodeArr.push(node);
            for (let i = nodeArr.length - 2; i >= 0; i--) {
                if (nodeArr[i].y - nodeArr[i + 1].y < 50) {
                    nodeArr[i].y = nodeArr[i + 1].y + 50;
                }
            }
        });
    }

    static showTileErrCode(code: number) {
        let one = cfg_all().errcode[code];
        if (one) {
            this.showTileInfo(one.des);
        }
    }

    delTileNode(node: cc.Node) {
        removeFromArr(this.tileNodeArr, node);
    }

    onDestroy() {
        UIMgr.instance = null;
    }
}

export const enum uiPanel {
    someInfoPanel = "someInfoPanel",
    tileInfo = "tileInfo",
    loginPanel = "login/loginPanel",
    registerPanel = "login/registerPanel",
    createRole = "login/createRole",

    gameMain = "map/gameMainPanel",
    bagPanel = "map/bagPanel",
    heroInfoPanel = "map/heroInfoPanel",
    gmPanel = "map/gmPanel",
    skillPanel = "map/skillPanel",
    settingPanel = "map/settingPanel",
    shopPanel = "map/shopPanel",
    monsterInfoPanel = "map/monsterInfoPanel",
}