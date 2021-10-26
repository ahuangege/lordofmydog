// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { E_localStorageType, Game } from "../../common/game";
import { E_keyType } from "./inputKeyListen";

const { ccclass, property } = cc._decorator;


@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    private moveNode: cc.Node = null;
    @property({ type: cc.Enum(E_keyType) })
    private panelType: E_keyType = E_keyType.none;
    private moved = false;
    private time = 0;

    start() {
        if (!this.moveNode) {
            this.moveNode = this.node;
        }
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            this.moveNode.x += event.getDeltaX();
            this.moveNode.y += event.getDeltaY();
            this.moved = true;
        });

        if (this.panelType === E_keyType.none) {
            return;
        }
        let pos = Game.localStorage_getItem([E_localStorageType.panelPos, this.panelType]);
        if (!pos) {
            return;
        }
        let posVec: { "x": number, "y": number } = JSON.parse(pos);
        this.moveNode.x = posVec.x;
        this.moveNode.y = posVec.y;
    }

    update(dt) {
        this.time += dt;
        if (this.time >= 2) {
            this.time = 0;
            this.savePos();
        }
    }

    private savePos() {
        if (this.panelType === E_keyType.none) {
            return;
        }
        if (!this.moved) {
            return;
        }
        this.moved = false;
        let str = JSON.stringify({ "x": Math.floor(this.moveNode.x), "y": Math.floor(this.moveNode.y) });
        Game.localStorage_setItem([E_localStorageType.panelPos, this.panelType], str);
    }

    onDestroy() {
        this.savePos();
    }



}

