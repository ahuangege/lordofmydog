import { nowSec } from "../../common/time";
import { Dic } from "../../util/util";
import { Role } from "../role";
import * as fs from "fs";
import * as path from "path";

let skillFuncDic: Dic<typeof SkillBase> = {};

/** 加载技能 */
export function loadSkill() {
    let dirName = path.join(__dirname, "./");
    fs.readdirSync(dirName).forEach(function (filename) {
        if (!filename.endsWith(".js")) {
            return;
        }
        require(path.join(dirName, filename));
    });
}

/** 技能注册（装饰器） */
export function registerSkill(skillCon: typeof SkillBase) {
    skillFuncDic[skillCon.name] = skillCon;
}


/** 技能管理 */
export class SkillMgr {
    public role: Role
    private skillDic: Dic<SkillBase> = {};
    private nowSkillId: number = 0; // 当前进行中的技能
    constructor(role: Role) {
        this.role = role;
    }

    /** 添加技能 */
    addSkill(skillId: number) {
        if (this.skillDic[skillId]) {
            return;
        }
        this.skillDic[skillId] = new skillFuncDic[skillId](skillId, this);
    }
    /** 删除技能 */
    delSkill(skillId: number) {

    }

    /** 使用技能 */
    useSkill(info: I_userSkill) {
        let skill = this.skillDic[info.skillId];
        if (!skill || !skill.canUse(info)) {
            return;
        }
        if (!this.role.buffMgr.canUseSkill()) {
            return;
        }
        if (this.nowSkillId) {
            let nowSkill = this.skillDic[this.nowSkillId];
            nowSkill && nowSkill.beBreak();
        }
        skill.useSkill(info);
    }

    /** 设置当前使用中的技能（针对不是瞬发的技能） */
    setNowSkillId(skillId: number) {
        this.nowSkillId = skillId;
    }
}

interface I_userSkill {
    skillId: number,
}



export class SkillBase {
    skillId: number;    // 技能id
    skillMgr: SkillMgr;
    cd: number = 0; // 下次可释放技能的时间

    constructor(skillId: number, skillMgr: SkillMgr) {
        this.skillId = skillId;
        this.skillMgr = skillMgr;
    }

    /** 能否使用 */
    canUse(info: I_userSkill): boolean {
        if (nowSec() < this.cd) {
            return false;
        }
        return true;
    }

    /** 使用技能 */
    useSkill(info: I_userSkill) {
    }

    /** 开始cd */
    cdStart() {

    }

    /** 技能被打断 */
    beBreak() {

    }

    /** 销毁，角色移除时使用 */
    destroy() {

    }
}


