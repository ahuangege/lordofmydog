// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Game, I_bagItem } from "../../common/game";
import { getItemImg } from "../../util/gameUtil";
import { BagItemPrefab } from "./bagItemPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export class BagPanel extends cc.Component {

    static instance: BagPanel = null;

    @property(cc.Node)
    private dragItem: cc.Node = null;
    @property(cc.Node)
    private delOrDropNode: cc.Node = null;

    private items: BagItemPrefab[] = [];

    onLoad() {
        BagPanel.instance = this;
    }

    start() {
        this.setDragItem(0, 0, null);
        let itemArr = this.node.getChildByName("items").children;
        for (let i = 0; i < itemArr.length; i++) {
            let one = itemArr[i].getComponent(BagItemPrefab);
            one.i = i;
            this.items.push(one);
        }
        let bag = Game.roleInfo.bag;
        for (let one of bag) {
            this.items[one.i].init(one);
        }
    }


    setDragItem(id: number, num: number, pos: cc.Vec2) {
        if (id === 0) {
            this.dragItem.active = false;
            this.delOrDropNode.active = false;
            return;
        }
        this.delOrDropNode.active = true;
        this.dragItem.active = true;
        getItemImg(id, (img) => {
            this.dragItem.getComponent(cc.Sprite).spriteFrame = img;
        });
        this.dragItem.children[0].getComponent(cc.Label).string = num === 1 ? "" : num.toString();
        this.setDragItemPos(pos);
    }

    setDragItemPos(pos: cc.Vec2) {
        let localPos = this.node.convertToNodeSpaceAR(pos);
        this.dragItem.setPosition(localPos.x, localPos.y);
    }

    onItemChanged(arr: I_bagItem[]) {
        for (let one of arr) {
            this.items[one.i].init(one);
        }
    }

    btn_close() {
        this.node.destroy();
    }

    onDestroy() {
        BagPanel.instance = null;
    }
}
