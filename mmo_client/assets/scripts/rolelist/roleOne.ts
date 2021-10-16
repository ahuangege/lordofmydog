// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { network } from "../common/network";
import { UIMgr, uiPanel } from "../common/uiMgr";
import { RolelistMain } from "./rolelistMain";

const { ccclass, property } = cc._decorator;

@ccclass
export class RoleOne extends cc.Component {

    info: I_roleOne = null;
    private _isSelect: boolean = false;

    init(info: I_roleOne) {
        this.info = info;
        this.node.getChildByName("label_create").active = false;
        this.node.getChildByName("btn_del").active = true;
        this.node.getChildByName("nickname").getComponent(cc.Label).string = info.nickname;
        this.node.getChildByName("lv").getComponent(cc.Label).string = "LV " + info.level;
        this.node.getChildByName("hero").active = true;
    }

    btn_click() {
        if (!this.info) {
            UIMgr.showPanel(uiPanel.createRole);
            return;
        }
        if (this.selected) {
            return;
        }
        let list = RolelistMain.instance.rolelist;
        for (let one of list) {
            if (one.selected) {
                one.selected = false;
                break;
            }
        }
        this.selected = true;
    }

    btn_del() {
        if (!this.info) {
            return;
        }
        UIMgr.showSomeInfo("确定要删除角色吗？", true, () => {
            network.sendMsg(cmd.connector_role_deleteRole, { "uid": this.info.uid });
        });
    }

    be_delete() {
        this.info = null;
        this.node.getChildByName("label_create").active = true;
        this.node.getChildByName("hero").active = false;
        this.node.getChildByName("btn_del").active = false;
        this.node.getChildByName("nickname").getComponent(cc.Label).string = "";
        this.node.getChildByName("lv").getComponent(cc.Label).string = "";
        if (this.selected) {
            this.selected = false;
            let list = RolelistMain.instance.rolelist;
            for (let one of list) {
                if (one.info) {
                    one.selected = true;
                    break;
                }
            }
        }
    }


    get selected() {
        return this._isSelect;
    }
    set selected(isSelect: boolean) {
        this._isSelect = isSelect;
        this.node.getChildByName("select").children[0].active = isSelect;
    }
}


export interface I_roleOne {
    uid: number,
    heroId: number,
    level: number,
    nickname: string
}