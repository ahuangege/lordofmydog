import { cfg_all } from "../../common/configUtil";
import { nowSec } from "../../common/time";
import { Role } from "../role";
import { I_useSkill, registerSkill, SkillBase, SkillMgr } from "./skillMgr";

@registerSkill
export class skill_1001 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    useSkill(info: I_useSkill) {
        let cfg = cfg_all().skill[this.skillId];

        // this.skillMgr.setNowSkillId(this.skillId);
        this.cd = nowSec() + cfg.cd;

        let role = this.skillMgr.role;
        let role2 = role.map.getEntity<Role>(info.id);

        role.subMp(cfg.mpCost);
        let hurt = this.getHurt_p(role.attack, role2);
        role2.subHp(hurt);
        this.sendMsg_useSkill(role, { "id": role.id, "skillId": this.skillId, "id2": role2.id, "data": [{ "id": role2.id, "hurt": hurt, "hp": role2.hp }] });

        // this.skillMgr.setNowSkillId(0);
    }
}


@registerSkill
export class skill_1002 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }
}