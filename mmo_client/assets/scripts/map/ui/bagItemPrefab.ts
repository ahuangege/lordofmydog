// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { I_bagItem } from "../../common/game";
import { network } from "../../common/network";
import { getItemHintInfo, getItemImg } from "../../util/gameUtil";
import { MapMain } from "../mapMain";
import { BagPanel } from "./bagPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class BagItemPrefab extends cc.Component {

    i: number = 0;
    id: number = 0;
    num: number = 0;

    @property(cc.Sprite)
    private imgSprite: cc.Sprite = null;
    @property(cc.Label)
    private numLabel: cc.Label = null;


    start() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, (event: cc.Event.EventMouse) => {
            if (!this.id) {
                return;
            }
            let pos = this.node.convertToWorldSpaceAR(new cc.Vec2(this.node.width / 2 - 10, this.node.height / 2 - 10))
            MapMain.instance.setHintInfo(getItemHintInfo(this.id), pos);
        });
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (event: cc.Event.EventMouse) => {
            if (!this.id) {
                return;
            }
            MapMain.instance.setHintInfo("", null);
        });

        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            if (!this.id) {
                return;
            }
            MapMain.instance.setHintInfo("", null);
            BagPanel.instance.setDragItem(this.id, this.num, event.getLocation());
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (!this.id) {
                return;
            }
            BagPanel.instance.setDragItemPos(event.getLocation());
        });
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (!this.id) {
                return;
            }
            BagPanel.instance.setDragItem(0, 0, null);
        });


        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            if (!this.id) {
                return;
            }
            BagPanel.instance.setDragItem(0, 0, null);
            cc.game.emit("onBagItemDrop", this.i, event.getLocation());
        });
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
        network.sendMsg(cmd.info_bag_changePos, { "index1": index, "index2": this.i });
    }


    init(info: I_bagItem) {
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



    onDestroy() {
        cc.game.off("onBagItemDrop", this.onBagItemDrop, this);
    }
}
