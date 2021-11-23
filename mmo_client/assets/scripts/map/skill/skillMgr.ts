
import { cmd } from "../../common/cmdClient";
import { cfg_all } from "../../common/configUtil";
import { network } from "../../common/network";
import { Dic } from "../mapMain";
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
    useSkill(info: any) {

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


/** 注意：请不要直接实例化此类 */
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

    /** 能否使用 */
    canUse(info: any): boolean {
        // if (nowSec() < this.cd) {
        //     return false;
        // }
        return true;
    }

    /** 使用技能 */
    useSkill(info: any) {
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

    /** 点击技能（想要使用该技能） */
    btnSkill() {
        if (this.cd > 0) {
            return;
        }
        this.cd = this.cdBase;
        let cfg = cfg_all().skill[this.skillId];
        if (cfg.targetType === E_skillTargetType.noTarget) {
            this.skillMgr.tellSvrUseSkill({ "skillId": this.skillId });
        } else {
            SkillPre.instance.setTarget({ "targetType": cfg.targetType, "cb": this.targetSelected, "self": this });
        }
    }

    private targetSelected(param: { "id": number, "pos": cc.Vec2 }) {
        let cfg = cfg_all().skill[this.skillId];
        if (cfg.targetType === E_skillTargetType.floor) {

        } else {

        }

    }
}
