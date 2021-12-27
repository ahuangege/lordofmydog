// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { network } from "../../common/network";
import { getItemImg } from "../../util/gameUtil";
import { Entity, Entity_type } from "../entity";
import { MapMain } from "../mapMain";

const { ccclass, property } = cc._decorator;

@ccclass
export class MapItemPrefab extends Entity {

    protected start(): void {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            if (event.getButton() === cc.Event.EventMouse.BUTTON_RIGHT) {

                if (cc.Vec2.distance(this.node, MapMain.instance.mePlayer.node) > 200) {
                    return;
                }
                network.sendMsg(cmd.map_main_pickItem, { "id": this.id });

            }

        });
    }

    init(one: I_itemJson) {
        this.id = one.id;
        this.t = one.t;

        this.node.children[0].getComponent(cc.Label).string = one.num === 1 ? "" : one.num.toString();
        getItemImg(one.itemId, (img) => {
            if (!img || !cc.isValid(this)) {
                return;
            }
            this.getComponent(cc.Sprite).spriteFrame = img;
        });
    }
}

export interface I_itemJson {
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    itemId: number;
    num: number;
}
