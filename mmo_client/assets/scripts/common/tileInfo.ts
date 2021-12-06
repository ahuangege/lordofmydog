// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UIMgr } from "./uiMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class TileInfo extends cc.Component {

    @property(cc.Label)
    private text: cc.Label = null;
    private delayTime = 0;
    init(info: string) {
        this.text.string = info;
    }

    update(dt: number) {
        this.delayTime += dt;
        if (this.delayTime > 0.7) {
            this.node.y += 500 * dt;
            if (this.node.y > 500) {
                this.node.destroy();
            }
        }
    }

    onDestroy() {
        if (cc.isValid(UIMgr.instance)) {
            UIMgr.instance.delTileNode(this.node);
        }
    }
}
