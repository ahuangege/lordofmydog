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
import { SkillLearnPrefab } from "./skillLearnPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export class SkillPanel extends cc.Component {

    static instance: SkillPanel = null;
    @property(cc.Node)
    private skillParent: cc.Node = null;

    onLoad() {
        SkillPanel.instance = this;
    }

    start() {
        let children = this.skillParent.children;
        let skillArr = cfg_all().hero[Game.roleInfo.heroId].skill;
        for (let i = 0; i < children.length; i++) {
            children[i].getComponent(SkillLearnPrefab).init(skillArr[i]);
        }

        network.addHandler(cmd.info_main_learnSkill, this.svr_learnSkillBack, this);
    }



    private svr_learnSkillBack(msg: { "code": number, "skillId": number }) {
        if (msg.code === 0) {
            Game.roleInfo.learnedSkill.push(msg.skillId);
            let skillArr = cfg_all().hero[Game.roleInfo.heroId].skill;
            let index = skillArr.indexOf(msg.skillId);
            this.skillParent.children[index].getComponent(SkillLearnPrefab).learned();
        }
    }

    btn_close() {
        this.node.destroy();
    }


    onDestroy() {
        network.removeThisHandlers(this);
        SkillPanel.instance = null;
    }
}
