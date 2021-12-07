
import { cfg_all } from "../../common/configUtil";
import { MapMain } from "../mapMain";
import { Role } from "../role";
import { I_onUseSkill, I_skillDataOne, registerSkill, SkillBase, SkillMgr } from "./skillMgr";

@registerSkill
export class skill_1001 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }


    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let data = info.data[0];
        let role2 = MapMain.instance.getEntity<Role>(data.id);
        role2.setHp(data.hp);
        MapMain.instance.showHurtNum(role2.node, data.hurt, true);
    }

}


@registerSkill
export class skill_1002 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let role = this.skillMgr.role;
        role.path.length = 0;

        cc.tween(role.node).to(0.1, { "x": info.x, "y": info.y }).start();

    }
}


@registerSkill
export class skill_1003 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let data = info.data[0];
        let role2 = MapMain.instance.getEntity<Role>(data.id);
        role2.setHp(data.hp);
        MapMain.instance.showHurtNum(role2.node, data.hurt, false);
    }
}


@registerSkill
export class skill_1004 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;
    }

    skillAffect(msg: { "data": I_skillDataOne[] }) {
        for (let one of msg.data) {
            let role2 = MapMain.instance.getEntity<Role>(one.id);
            role2.setHp(one.hp);
            MapMain.instance.showHurtNum(role2.node, one.hurt, true);
        }
    }

    skillOver() {
        console.log("skillover", this.skillId)
    }
}
