// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { cfg_all } from "../../common/configUtil";
import { Game } from "../../common/game";
import { network } from "../../common/network";
import { UIMgr } from "../../common/uiMgr";
import { GameEvent, getSkillHintInfo, getSkillImg } from "../../util/gameUtil";
import { E_dragType, MapMain } from "../mapMain";

const { ccclass, property } = cc._decorator;

@ccclass
export class SkillLearnPrefab extends cc.Component {

    private skillId = 0;
    private _learned = false;

    start() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, (event: cc.Event.EventMouse) => {
            let pos = this.node.convertToWorldSpaceAR(new cc.Vec2(this.node.width / 2 - 10, this.node.height / 2 - 10));
            MapMain.instance.setHintInfo(getSkillHintInfo(this.skillId), pos, this.node);
        });
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (event: cc.Event.EventMouse) => {
            MapMain.instance.setHintInfo("", null, null);
        });

        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            if (!this._learned) {
                return;
            }
            MapMain.instance.setDragImg(E_dragType.skill, this.skillId, 1, event.getLocation(), this.node);
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            if (!this._learned) {
                return;
            }
            MapMain.instance.setDragImgPos(event.getLocation());
        });
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (!this._learned) {
                return;
            }
            MapMain.instance.setDragImg(E_dragType.item, 0, 0, null, null);
        });
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            if (!this._learned) {
                return;
            }
            MapMain.instance.setDragImg(E_dragType.item, 0, 0, null, null);
            cc.game.emit(GameEvent.onSkillDrop, this.skillId, event.getLocation());
        });
    }

    init(skillId: number) {
        this.skillId = skillId;
        getSkillImg(skillId, (img) => {
            this.getComponent(cc.Sprite).spriteFrame = img;
        });
        if (Game.roleInfo.learnedSkill.includes(skillId)) {
            this.node.children[0].active = false;
            this._learned = true;
        }
    }

    btn_learn() {
        let cfg = cfg_all().hero[Game.roleInfo.heroId];
        let index = cfg.skill.indexOf(this.skillId);
        if (index === -1) {
            return;
        }
        let level = cfg.skillUnlockLv[index];
        if (Game.roleInfo.level < level) {
            return UIMgr.showSomeInfo("技能解锁等级：" + level);
        }
        network.sendMsg(cmd.info_main_learnSkill, { "skillId": this.skillId });
    }

    learned() {
        this.node.children[0].active = false;
        this._learned = true;
    }
}
