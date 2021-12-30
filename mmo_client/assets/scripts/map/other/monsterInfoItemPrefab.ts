// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { getItemHintInfo, getItemImg } from "../../util/gameUtil";
import { MapMain } from "../mapMain";

const { ccclass, property } = cc._decorator;

@ccclass
export class MonsterInfoItemPrefab extends cc.Component {


    private id = 0;

    start() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, (event: cc.Event.EventMouse) => {
            if (!this.id) {
                return;
            }
            let pos = this.node.convertToWorldSpaceAR(new cc.Vec2(this.node.width / 2 - 10, this.node.height / 2 - 10));
            MapMain.instance.setHintInfo(getItemHintInfo(this.id), pos, this.node);
        });
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (event: cc.Event.EventMouse) => {
            if (!this.id) {
                return;
            }
            MapMain.instance.setHintInfo("", null, null);
        });

    }



    init(id: number) {
        this.id = id;
        getItemImg(id, (img) => {
            if (cc.isValid(this)) {
                this.getComponent(cc.Sprite).spriteFrame = img;
            }
        });

    }
}
