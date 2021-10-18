// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { cfg_all } from "../../common/configUtil";
import { Game, I_bagItem, I_Item } from "../../common/game";
import { network } from "../../common/network";
import { E_itemT, getItemImg } from "../../util/gameUtil";
import { MapMain } from "../mapMain";
import { BagPanel } from "./bagPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class HpMpPrefab extends cc.Component {

    @property(cc.Boolean)
    private isHp = true;
    @property(cc.Sprite)
    private imgSprite: cc.Sprite = null;
    @property(cc.Label)
    private numLabel: cc.Label = null;

    private id = 0;
    private num = 0;


    start() {
        cc.game.on("onBagItemDrop", this.onBagItemDrop, this);
    }



    init(info: I_Item) {
        this.num = info.num;
        if (this.num <= 0) {
            this.id = 0;
            this.numLabel.string = "";
            this.imgSprite.spriteFrame = null;
        } else {
            this.numLabel.string = info.num === 1 ? "" : info.num.toString();
            if (this.id !== info.id) {
                this.id = info.id;
                getItemImg(info.id, (img) => {
                    if (cc.isValid(this)) {
                        this.imgSprite.spriteFrame = img;
                    }
                });
            }
        }
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
        let item = Game.getItemByI(index);
        if (!item) {
            return;
        }
        let cfg = cfg_all().item[item.id];
        let equipT = this.isHp ? E_itemT.hp : E_itemT.mp;
        if (cfg.type !== equipT) {
            return;
        }
        network.sendMsg(cmd.info_bag_equipItem, { "index": index, "t": equipT });
    }


    onDestroy() {
        cc.game.off("onBagItemDrop", this.onBagItemDrop, this);
    }
}
