// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { network } from "../../common/network";
import { GameEvent, getSkillImg } from "../../util/gameUtil";
import { MapMain } from "../mapMain";

const { ccclass, property } = cc._decorator;

@ccclass
export class SkillPrefab extends cc.Component {

    index: number = 0;
    skillId = 0;
    @property(cc.Sprite)
    private skillImg: cc.Sprite = null;
    private cdImg: cc.Sprite = null;

    onLoad() {
        this.cdImg = this.node.getChildByName("cd").getComponent(cc.Sprite);
    }

    start() {
        cc.game.on(GameEvent.onSkillDrop, this.onSkillDrop, this);
    }

    init(skillId: number) {
        this.skillId = skillId;
        if (skillId == 0) {
            this.skillImg.spriteFrame = null;
            this.cdImg.fillRange = 0;
        } else {
            getSkillImg(skillId, (img) => {
                this.skillImg.spriteFrame = img;
            });
        }
    }

    private onSkillDrop(skillId: number, pos: cc.Vec2) {
        if (this.skillId === skillId) {
            return;
        }
        let skill = MapMain.instance.mePlayer.skillMgr.getSkill(skillId);
        if (skill && skill.cd > 0) {
            return;
        }
        if (this.skillId !== 0) {
            skill = MapMain.instance.mePlayer.skillMgr.getSkill(this.skillId);
            if (skill && skill.cd > 0) {
                return;
            }
        }

        let node = this.node;
        let localPos = node.convertToNodeSpaceAR(pos);

        let minX = -node.anchorX * node.width;
        let maxX = (1 - node.anchorX) * node.width;
        let minY = -node.anchorY * node.height;
        let maxY = (1 - node.anchorY) * node.height;
        if (localPos.x < minX || localPos.x > maxX || localPos.y < minY || localPos.y > maxY) {
            return;
        }

        network.sendMsg(cmd.info_main_equipSkill, { "skillId": skillId, "index": this.index });
    }

    btn_click() {
        if (!this.skillId) {
            return;
        }
        cc.tween(this.node).to(0.1, { "scale": 1.1 }).to(0.1, { "scale": 1 }).start();
        MapMain.instance.mePlayer.skillMgr.btnSkill(this.skillId);
    }

    update(dt: number) {
        if (this.skillId === 0) {
            return;
        }
        let meP = MapMain.instance.mePlayer;
        if (!meP) {
            return;
        }
        let skill = meP.skillMgr.getSkill(this.skillId);
        if (!skill) {
            return;
        }
        if (skill.cd <= 0) {
            return;
        }
        skill.cd -= dt;
        if (skill.cd <= 0) {
            skill.cd = 0;
        }
        this.cdImg.fillRange = skill.cd / skill.cdBase;
    }

    onDestroy() {
        cc.game.off(GameEvent.onSkillDrop, this.onSkillDrop, this);
    }
}
