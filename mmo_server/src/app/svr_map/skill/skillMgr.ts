import { nowSec } from "../../common/time";
import { Dic } from "../../util/util";
import { Role } from "../role";
import * as fs from "fs";
import * as path from "path";
import { gameLog } from "../../common/logger";

/** 技能实现集合 */
let skillConDic: Dic<typeof SkillBase> = {};

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

/**
 * 技能注册（装饰器）
 */
export function registerSkill(skillCon: typeof SkillBase) {
    // gameLog.debug("技能注册（装饰器）", skillCon.name.substr(6));
    skillConDic[skillCon.name.substr(6)] = skillCon;
}


/** 技能管理 */
export class SkillMgr {
    public role: Role;  // 对应角色
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
        let skillCon = skillConDic[skillId];
        if (skillCon) {
            this.skillDic[skillId] = new skillCon(this);
        } else {
            gameLog.warn("没有技能实现", skillId)
        }
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


/** 注意：请不要直接实例化此类 */
export class SkillBase {
    skillId: number;    // 技能id
    skillMgr: SkillMgr;
    cd: number = 0; // 下次可释放技能的时间

    constructor(skillMgr: SkillMgr) {
        this.skillId = Number((this as Object).constructor.name.substr(6));
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

    /** 销毁 */
    destroy() {

    }
}


