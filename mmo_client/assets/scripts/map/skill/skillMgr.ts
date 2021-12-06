
import { cmd } from "../../common/cmdClient";
import { cfg_all } from "../../common/configUtil";
import { network } from "../../common/network";
import { UIMgr } from "../../common/uiMgr";
import { Entity_type } from "../entity";
import { Dic, MapMain } from "../mapMain";
import { I_xy, Player } from "../player";
import { Role } from "../role";
import { E_skillTargetType, SkillPre } from "./skillPre";

/** 技能实现集合 */
let skillConDic: Dic<typeof SkillBase> = {};

/**
 * 技能注册（装饰器）
 */
export function registerSkill(skillCon: typeof SkillBase) {
    skillConDic[skillCon.name.substr(6)] = skillCon;
}

/** 技能管理 */
export class SkillMgr {
    public role: Role;  // 对应角色
    private skillDic: Dic<SkillBase> = {};
    constructor(role: Role) {
        this.role = role;
    }


    /** 添加技能 */
    addSkill(skillId: number) {
        if (this.skillDic[skillId]) {
            return null;
        }
        let skillCon = skillConDic[skillId];
        if (skillCon) {
            this.skillDic[skillId] = new skillCon(this);
        } else {
            console.warn("没有技能实现", skillId)
        }
        return this.skillDic[skillId];
    }

    /** 删除技能 */
    delSkill(skillId: number) {

    }

    /** 使用技能 */
    useSkill(msg: I_onUseSkill) {
        let skill = this.getSkill(msg.skillId);
        if (skill) {
            skill.useSkill(msg);
        }
    }

    getSkill(skillId) {
        return this.skillDic[skillId];
    }

    /** 告诉服务器要使用技能 */
    tellSvrUseSkill(msg: { "skillId": number, "id"?: number, "x"?: number, "y"?: number }) {
        network.sendMsg(cmd.map_main_useSkill, msg);
    }


    /** 点击技能（想要使用该技能） */
    btnSkill(skillId) {
        let skill = this.getSkill(skillId);
        if (!skill) {
            console.log("没有该技能", skillId)
            return;
        }
        skill.btnSkill();
    }


}


/** 技能基类 */
export class SkillBase {
    skillId: number;    // 技能id
    skillMgr: SkillMgr;
    cdBase: number = 0;
    cd: number = 0; // 剩余时间

    constructor(skillMgr: SkillMgr) {
        this.skillId = Number((this as Object).constructor.name.substr(6));
        this.skillMgr = skillMgr;
        this.cdBase = cfg_all().skill[this.skillId].cd;
    }

    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
    }


    /** 技能被打断 */
    beBreak() {

    }

    /** 销毁 */
    destroy() {

    }

    /** 点击技能（想要使用该技能） */
    btnSkill() {
        if (this.cd > 0) {
            UIMgr.showTileInfo("技能cd中");
            return;
        }
        let cfg = cfg_all().skill[this.skillId];
        if (this.skillMgr.role.mp < cfg.mpCost) {
            UIMgr.showTileInfo("魔法不足");
            return;
        }

        if (cfg.targetType === E_skillTargetType.noTarget) {
            this.skillMgr.tellSvrUseSkill({ "skillId": this.skillId });
        } else {
            SkillPre.instance.setTarget({ "targetType": cfg.targetType, "cb": this.targetSelected, "self": this });
        }
    }

    /** 指向性技能，选择目标回调 */
    private targetSelected(param: { "id": number, "pos": cc.Vec2 }) {
        let cfg = cfg_all().skill[this.skillId];
        if (cfg.targetType === E_skillTargetType.floor) {
            if (cc.Vec2.distance<I_xy>(this.skillMgr.role.node, param.pos) > cfg.targetDistance) {
                UIMgr.showTileInfo("超过施法距离");
            } else {
                this.skillMgr.tellSvrUseSkill({ "skillId": this.skillId, "x": Math.floor(param.pos.x), "y": Math.floor(param.pos.y) });
            }
            return;
        }

        if (!param.id) {
            return UIMgr.showTileInfo("需要以某个单位为目标");;
        }
        let meP = this.skillMgr.role as Player;
        let otherP = MapMain.instance.getEntity<Player>(param.id);
        if (!otherP || otherP.hp <= 0) {
            return;
        }
        if (otherP.t === Entity_type.item) {    // 道具
            return;
        } else if (otherP.t === Entity_type.monster) {  // 野怪
            if (cfg.targetType === E_skillTargetType.notEnemy) {
                return UIMgr.showTileInfo("不能以野怪为目标");
            }
        } else {    // 玩家
            if (cfg.targetType === E_skillTargetType.enemy) {
                if (meP === otherP) {
                    return UIMgr.showTileInfo("不能以自己为目标");
                }
            } else {
                if (meP !== otherP) {
                    return UIMgr.showTileInfo("必须以友方为目标");
                }
            }
        }
        if (cc.Vec2.distance<I_xy>(this.skillMgr.role.node, otherP.node) > cfg.targetDistance) {
            return UIMgr.showTileInfo("超过施法距离");
        }

        this.skillMgr.tellSvrUseSkill({ "skillId": this.skillId, "id": param.id });
    }
}

/** 通知使用技能 */
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