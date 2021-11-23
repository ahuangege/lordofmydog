// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EscGo } from "../map/ui/escGo";

const { ccclass, property } = cc._decorator;

@ccclass
export class SomeInfo extends cc.Component {

    @property(cc.Label)
    private label: cc.Label = null;
    private showCloseBtn = true;
    private yesCb: () => void;

    showInfo(info: string, showCloseBtn: boolean, yesCb?: () => void) {
        this.label.string = info;
        this.showCloseBtn = showCloseBtn;
        this.yesCb = yesCb;
        if (showCloseBtn) {
            this.addComponent(EscGo);
        } else {
            this.node.getChildByName("btn_close").active = false;
        }
    }

    btn_close() {
        if (this.showCloseBtn) {
            this.node.destroy();
        }
    }

    btn_yes() {
        this.node.destroy();
        if (this.yesCb) {
            this.yesCb();
        }
    }
}
