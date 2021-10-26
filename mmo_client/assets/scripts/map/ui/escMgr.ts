// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { removeFromArr } from "../../util/gameUtil";
import { EscGo } from "./escGo";

const { ccclass, property } = cc._decorator;

@ccclass
export class EscMgr extends cc.Component {
    static instance: EscMgr = null;

    private escId = 0;
    private escComArr: EscGo[] = [];

    onLoad() {
        EscMgr.instance = this;
    }

    start() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        if (event.keyCode === cc.macro.KEY.escape) {
            if (this.escComArr.length === 0) {
                return;
            }
            let up = this.escComArr[0];
            for (let one of this.escComArr) {
                if (one.index > up.index) {
                    up = one;
                }
            }
            up.called();
        }
    }


    getEscId() {
        return this.escId++;
    }

    addEsc(escCom: EscGo) {
        this.escComArr.push(escCom);
    }
    delEsc(escCom: EscGo) {
        removeFromArr(this.escComArr, escCom);
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        EscMgr.instance = null;
    }
}
