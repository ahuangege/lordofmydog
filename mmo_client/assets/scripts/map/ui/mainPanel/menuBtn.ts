// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UIMgr, uiPanel } from "../../../common/uiMgr";
import { MapMain } from "../../mapMain";
import { BagPanel } from "../bagPanel";
import { GmPanel } from "../gmPanel";
import { HeroInfoPanel } from "../heroInfoPanel";
import { E_keyType, InputKeyListen } from "../inputKeyListen";
import { SkillPanel } from "../skillPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class MenuBtn extends cc.Component {
    @property(cc.Node)
    private node_btns: cc.Node = null;

    btn_Menuclick() {
        this.node_btns.active = !this.node_btns.active;
    }

    btn_func(event: cc.Event.EventTouch) {
        this.node_btns.active = false;
        this.showPanel(event.target.name);
    }

    showPanel(name: string) {
        switch (name) {
            case "bag":
                InputKeyListen.instance.showPanel(E_keyType.bag);
                break;
            case "heroInfo":
                InputKeyListen.instance.showPanel(E_keyType.heroInfo);
                break;
            case "skill":
                InputKeyListen.instance.showPanel(E_keyType.skill);
                break;
            case "gm":
                InputKeyListen.instance.showPanel(E_keyType.gm);
                break;
            case "setting":
                InputKeyListen.instance.showPanel(E_keyType.setting);
                break;
            default:
                console.warn("no panel：", name);
                break;
        }
    }
}
