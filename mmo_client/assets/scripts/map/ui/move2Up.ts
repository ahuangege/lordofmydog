// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EscGo } from "./escGo";

const { ccclass, property } = cc._decorator;

@ccclass
export class Move2Up extends cc.Component {

    @property(EscGo)
    private escGo: EscGo = null;

    toUp() {
        this.node.setSiblingIndex(-1);
        if (this.escGo) {
            this.escGo.refresh();
        }
    }
}
