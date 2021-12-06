import { nowSec } from "../../common/time";
import { Dic, getLen, getLen2 } from "../../util/util";
import { Role } from "../role";
import * as fs from "fs";
import * as path from "path";
import { gameLog } from "../../common/logger";
import { cfg_all } from "../../common/configUtil";
import { Entity_type } from "../entity";
import { cmd } from "../../../config/cmd";

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
    useSkill(info: I_useSkill) {
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

export interface I_useSkill {
    "skillId": number,
    "id": number,
    "x": number,
    "y": number
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
    canUse(info: I_useSkill): boolean {
        if (nowSec() < this.cd) {   // 技能cd未好
            return false;
        }
        let cfg = cfg_all().skill[this.skillId];
        let role = this.skillMgr.role;
        if (role.mp < cfg.mpCost) {   // 魔法消耗不足
            return false;
        }
        if (cfg.targetType === E_skillTargetType.noTarget) {    // 无需目标即可释放
            return true;
        }

        if (cfg.targetType === E_skillTargetType.floor) {   // 点地释放
            info.x = Math.floor(info.x) || 0;
            info.y = Math.floor(info.y) || 0;
            // if (!role.map.isPosOk(info)) {    // 不可行走区域
            //     return false;
            // }
            if (getLen(role, info) > cfg.targetDistance + 64) {  // 施法距离不够（服务器允许的坐标误差：64）
                return false;
            }
            return true;
        }

        let role2 = role.map.getEntity<Role>(info.id);
        if (!role2 || role2.hp <= 0) {
            return false;
        }
        if (role2.t === Entity_type.item) {    // 道具
            return false;
        } else if (role2.t === Entity_type.monster) {  // 野怪
            if (cfg.targetType === E_skillTargetType.notEnemy) {
                return false;
            }
        } else {    // 玩家
            if (cfg.targetType === E_skillTargetType.enemy) {
                if (role === role2) {
                    return false;
                }
            } else {
                if (role !== role2) {
                    return false;
                }
            }
        }
        if (getLen(role, role2) > cfg.targetDistance + 64) {
            return false;
        }
        return true;
    }

    /** 使用技能 */
    useSkill(info: I_useSkill) {
    }




    /** 技能被打断 */
    beBreak() {

    }

    /** 销毁 */
    destroy() {

    }

    /** 计算物理攻击造成的伤害  physical */
    getHurt_p(damage: number, role2: Role) {
        return Math.round(damage * role2.armor_p);
    }

    /** 计算魔法攻击造成的伤害  magic */
    getHurt_m(damage: number, role2: Role) {
        return Math.round(damage * role2.armor_m);
    }

    /** 发送使用技能的消息 */
    sendMsg_useSkill(role: Role, msg: I_onUseSkill) {
        role.map.sendMsgByAOI(role, cmd.onUseSkill, msg);
    }
}

/** 技能目标类型 */
export const enum E_skillTargetType {
    /** 无需目标，直接释放 */
    noTarget = 1,
    /** 点地释放 */
    floor = 2,
    /** 对非敌方释放 */
    notEnemy = 3,
    /** 对敌方释放 */
    enemy = 4,
}

export interface I_onUseSkill {
    "id": number,
    "skillId": number,
    "id2"?: number,
    "x"?: number,
    "y"?: number,
    "data"?: I_skillDataOne[],
}

export interface I_skillDataOne {
    id: number,
    hurt: number,
    hp: number,
}