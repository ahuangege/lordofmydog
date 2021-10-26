// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { E_localStorageType, Game } from "../../common/game";
import { network } from "../../common/network";
import { Dic } from "../mapMain";
import { defaultKeySet, E_keyType, InputKeyListen, keySetValue } from "./inputKeyListen";
import { KeySetPrefab } from "./setting/keySetPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export class SettingPanel extends cc.Component {
    static instance: SettingPanel = null;

    private nowActiveNode: cc.Node = null;
    private keySetInit = false;
    keySetDic: Dic<KeySetPrefab> = {};
    private keySetTmp: Dic<string> = {};

    onLoad() {
        SettingPanel.instance = this;
    }

    start() {
        this.showPanel("account");
    }


    /** 登出 */
    btn_loginOut() {
        network.disconnect();
        cc.director.loadScene("rolelist");
    }

    /** 切换界面 */
    pannel_toggle_changed(toggle: cc.Toggle) {
        if (this.nowActiveNode === toggle.node) {
            return;
        }
        if (!toggle.isChecked) {
            return;
        }
        this.showPanel(toggle.node.name);
    }
    private showPanel(name: string) {
        if (this.nowActiveNode) {
            this.nowActiveNode.active = false;
        }

        if (name === "account") {
            this.nowActiveNode = cc.find("panelList/accountPanel", this.node);
        } else if (name === "keySet") {
            this.nowActiveNode = cc.find("panelList/keyPanel", this.node);
            this.initKeySet();
        } else if (name === "voice") {
            this.nowActiveNode = null;
        } else {
            this.nowActiveNode = null;
        }
        if (this.nowActiveNode) {
            this.nowActiveNode.active = true;
        }
    }

    private initKeySet() {
        if (this.keySetInit) {
            return;
        }
        this.keySetInit = true;

        let keySetOld = Game.keySet || defaultKeySet;
        for (let x in keySetOld) {
            this.keySetTmp[x] = keySetOld[x];
        }

        this.scheduleOnce(() => {
            for (let x in this.keySetDic) {
                this.keySetDic[x].setKeyValue(keySetOld[x] || "");
            }
        }, 0)

    }

    onKeySetChanged(keyType: E_keyType, value: string) {
        if (value === "") {
            this.keySetTmp[keyType] = "";
            return;
        }
        for (let x in this.keySetTmp) {
            if (this.keySetTmp[x] === value) {
                this.keySetTmp[x] = "";
                let tmp = this.keySetDic[x];
                if (tmp) {
                    tmp.setKeyValue("");
                }
            }
        }
        this.keySetDic[keyType].setKeyValue(value);
        this.keySetTmp[keyType] = value;
    }

    btn_saveKeySet() {
        let needSave = false;
        let saveStr = "";
        if (!Game.keySet) {
            needSave = true;
        } else {
            saveStr = JSON.stringify(this.keySetTmp);
            if (saveStr !== JSON.stringify(Game.keySet)) {
                needSave = true;
            }
        }
        if (needSave) {
            Game.keySet = {};
            for (let x in this.keySetTmp) {
                Game.keySet[x] = this.keySetTmp[x];
            }
            InputKeyListen.instance.refresh();
            Game.localStorage_setItem(E_localStorageType.keySet, saveStr || JSON.stringify(this.keySetTmp));
        }
    }

    btn_close() {
        this.node.destroy();
    }

    onDestroy() {
        SettingPanel.instance = null;
    }

}
