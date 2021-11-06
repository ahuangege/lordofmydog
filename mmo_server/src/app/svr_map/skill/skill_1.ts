import { registerSkill, SkillBase, SkillMgr } from "./skillMgr";

@registerSkill
export class skill_001 extends SkillBase {
    constructor(skillId: number, skillMgr: SkillMgr) {
        super(skillId, skillMgr);
    }
}