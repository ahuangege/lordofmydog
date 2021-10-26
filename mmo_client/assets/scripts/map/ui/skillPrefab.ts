// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { network } from "../../common/network";
import { GameEvent, getSkillImg } from "../../util/gameUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export class SkillPrefab extends cc.Component {

    index: number = 0;
    skillId = 0;
    @property(cc.Sprite)
    private skillImg: cc.Sprite = null;

    start() {
        cc.game.on(GameEvent.onSkillDrop, this.onSkillDrop, this);
    }

    init(skillId: number) {
        this.skillId = skillId;
        if (skillId == 0) {
            this.skillImg.spriteFrame = null;
        } else {
            getSkillImg(skillId, (img) => {
                this.skillImg.spriteFrame = img;
            });
        }
    }

    private onSkillDrop(skillId: number, pos: cc.Vec2) {
        let node = this.node;
        let localPos = node.convertToNodeSpaceAR(pos);

        let minX = -node.anchorX * node.width;
        let maxX = (1 - node.anchorX) * node.width;
        let minY = -node.anchorY * node.height;
        let maxY = (1 - node.anchorY) * node.height;
        if (localPos.x < minX || localPos.x > maxX || localPos.y < minY || localPos.y > maxY) {
            return;
        }
        if (this.skillId === skillId) {
            return;
        }
        network.sendMsg(cmd.info_main_equipSkill, { "skillId": skillId, "index": this.index });
    }


    onDestroy() {
        cc.game.off(GameEvent.onSkillDrop, this.onSkillDrop, this);
    }
}
