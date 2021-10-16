// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { network } from "../../common/network";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Boolean)
    private isDel: boolean = true;

    start() {
        cc.game.on("onBagItemDrop", this.onBagItemDrop, this);
    }

    private onBagItemDrop(index: number, pos: cc.Vec2) {
        let node = this.node;
        let localPos = node.convertToNodeSpaceAR(pos);

        let minX = -node.anchorX * node.width;
        let maxX = (1 - node.anchorX) * node.width;
        let minY = -node.anchorY * node.height;
        let maxY = (1 - node.anchorY) * node.height;
        if (localPos.x < minX || localPos.x > maxX || localPos.y < minY || localPos.y > maxY) {
            return;
        }
        if (this.isDel) {
            network.sendMsg(cmd.info_bag_delItem, { "index": index });
        } else {
            network.sendMsg(cmd.info_bag_dropItem, { "index": index });
        }
    }


    onDestroy() {
        cc.game.off("onBagItemDrop", this.onBagItemDrop, this);
    }
}
