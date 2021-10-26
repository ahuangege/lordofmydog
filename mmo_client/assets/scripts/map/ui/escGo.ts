// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EscMgr } from "./escMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class EscGo extends cc.Component {
    index = 0;
    @property(cc.Component.EventHandler)
    private callback: cc.Component.EventHandler = null;
    start() {
        EscMgr.instance.addEsc(this);
        this.refresh();
    }

    refresh() {
        this.index = EscMgr.instance.getEscId();
    }

    called() {
        if (this.callback && cc.isValid(this.callback.target)) {
            this.callback.emit([]);
        } else {
            this.node.destroy();
        }
    }

    onDestroy() {
        if (cc.isValid(EscMgr.instance)) {
            EscMgr.instance.delEsc(this);
        }
    }
}
