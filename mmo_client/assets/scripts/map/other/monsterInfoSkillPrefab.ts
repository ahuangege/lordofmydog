// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { getSkillHintInfo, getSkillImg } from "../../util/gameUtil";
import { MapMain } from "../mapMain";

const { ccclass, property } = cc._decorator;

@ccclass
export class MonsterInfoSkillPrefab extends cc.Component {

    private skillId = 0;

    start() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, (event: cc.Event.EventMouse) => {
            if (this.skillId) {
                let pos = this.node.convertToWorldSpaceAR(new cc.Vec2(this.node.width / 2 - 10, this.node.height / 2 - 10));
                MapMain.instance.setHintInfo(getSkillHintInfo(this.skillId), pos, this.node);
            }
        });
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (event: cc.Event.EventMouse) => {
            MapMain.instance.setHintInfo("", null, null);
        });
    }
    init(skillId: number) {
        this.skillId = skillId;
        getSkillImg(skillId, (img) => {
            this.getComponent(cc.Sprite).spriteFrame = img;
        });
    }


}
