
import { cfg_all } from "../../common/configUtil";
import { MapMain } from "../mapMain";
import { Role } from "../role";
import { I_onUseSkill, registerSkill, SkillBase, SkillMgr } from "./skillMgr";

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
        role2.showHurtNum(data.hurt, true);
    }

}


@registerSkill
export class skill_1002 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

}


@registerSkill
export class skill_1003 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

}


@registerSkill
export class skill_1004 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

}
