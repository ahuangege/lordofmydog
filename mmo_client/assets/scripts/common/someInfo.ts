// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export class SomeInfo extends cc.Component {

    @property(cc.Label)
    private label: cc.Label = null;
    private yesCb: () => void;

    showInfo(info: string, showCloseBtn: boolean = false, yesCb?: () => void) {
        this.label.string = info;
        this.yesCb = yesCb;
        if (showCloseBtn) {
            this.node.getChildByName("btn_close").active = true;
        }
    }

    btn_close() {
        this.node.destroy();
    }

    btn_yes() {
        this.node.destroy();
        if (this.yesCb) {
            this.yesCb();
        }
    }
}
