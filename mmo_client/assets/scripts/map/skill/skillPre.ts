// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { MapMain } from "../mapMain";

const { ccclass, property } = cc._decorator;

/** 释放技能前，预选择目标 */
@ccclass
export class SkillPre extends cc.Component {

    public static instance: SkillPre = null;
    @property(cc.Node)
    private cursorNode: cc.Node = null;
    private info: { "targetType": E_skillTargetType, "cb": (param: { "id": number, "pos": cc.Vec2 }) => void, "self": Object } = null;

    onLoad() {
        SkillPre.instance = this;
        this.cursorNode.active = false;
    }

    start() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            if (!this.info) {
                return;
            }
            if (event.getButton() === cc.Event.EventMouse.BUTTON_LEFT) {
                if (event.target !== this.node) {   // 点击到其他非 canvas 界面，则取消
                    this.cancel();
                } else {
                    this.scheduleOnce(() => {
                        this.callback({ "id": 0, "pos": MapMain.instance.screen2worldPoint(event.getLocation()) });
                        this.cancel();
                    }, 0);
                }

            } else {
                this.cancel();
            }
        }, this, true);

        this.node.on(cc.Node.EventType.MOUSE_MOVE, (event: cc.Event.EventMouse) => {
            if (!this.info) {
                return;
            }
            let pos = this.node.convertToNodeSpaceAR(event.getLocation());
            this.cursorNode.x = pos.x;
            this.cursorNode.y = pos.y;
        });
    }



    setTarget(info: { "targetType": E_skillTargetType, "cb": (param: { "id": number, "pos": cc.Vec2 }) => void, "self": Object } | null) {
        this.cancel();
        if (!info) {
            return;
        }
        this.info = info;
        this.cursorNode.active = true;
    }

    callback(param: { "id": number, "pos": cc.Vec2 }) {
        if (!this.info) {
            return;
        }
        let info = this.info;
        this.cancel();

        info.cb.call(info.self, param);
    }

    private cancel() {
        if (!this.info) {
            return;
        }
        this.info = null;
        this.cursorNode.active = false;
    }

    onDestroy() {
        SkillPre.instance = null;
    }
}


export const enum E_skillTargetType {
    /** 无需目标，直接释放 */
    noTarget = 1,
    /** 点地释放 */
    floor = 2,
    /** 对非敌方释放 */
    notEnemy = 3,
    /** 对敌方释放 */
    enemy = 4,
}