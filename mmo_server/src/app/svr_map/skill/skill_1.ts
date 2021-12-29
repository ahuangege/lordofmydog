import { cmd } from "../../../config/cmd";
import { cfg_all } from "../../common/configUtil";
import { nowSec } from "../../common/time";
import { Role } from "../role";
import { I_skillDataOne, I_useSkill, registerSkill, SkillBase, SkillMgr } from "./skillMgr";

@registerSkill
export class skill_1001 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    useSkill(info: I_useSkill) {
        let cfg = cfg_all().skill[this.skillId];

        // this.skillMgr.setNowSkillId(this.skillId);
        let role = this.skillMgr.role;
        this.cd = nowSec() + cfg.cd;
        role.subMp(cfg.mpCost);

        let role2 = role.map.getEntity<Role>(info.id);
        let hurt = this.getHurt_p(role.attack, role2);
        role2.subHp(hurt, role.id);
        this.sendMsg_useSkill({ "id": role.id, "skillId": this.skillId, "id2": role2.id, "data": [{ "id": role2.id, "hurt": hurt, "hp": role2.hp }] });

        // this.skillMgr.setNowSkillId(0);
    }
}

// 注：这是个位移技能，理论上需要服务器模拟移动过程，但是本demo位移极快，为了方便，直接移到终点
@registerSkill
export class skill_1002 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    useSkill(info: I_useSkill) {
        let cfg = cfg_all().skill[this.skillId];

        let role = this.skillMgr.role;
        this.cd = nowSec() + cfg.cd;
        role.subMp(cfg.mpCost);

        role.path.length = 0;
        role.changePos(info.x, info.y);

        let roleArr = role.map.getRolesAround(role, role, cfg.range, true);
        let hurtArr: I_skillDataOne[] = []
        for (let one of roleArr) {
            let hurt = this.getHurt_m(cfg.damage, one);
            one.buffMgr.addBuff(1);
            one.subHp(hurt, role.id);
            hurtArr.push({ "id": one.id, "hurt": hurt, "hp": one.hp });
        }
        this.sendMsg_useSkill({ "id": role.id, "skillId": this.skillId, "x": info.x, "y": info.y, "data": hurtArr });

    }
}

@registerSkill
export class skill_1003 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    useSkill(info: I_useSkill) {
        let cfg = cfg_all().skill[this.skillId];

        let role = this.skillMgr.role;
        this.cd = nowSec() + cfg.cd;
        role.subMp(cfg.mpCost);

        let role2 = role.map.getEntity<Role>(info.id);
        role2.addHp(cfg.damage);
        this.sendMsg_useSkill({ "id": role.id, "skillId": this.skillId, "id2": role2.id, "data": [{ "id": role2.id, "hurt": cfg.damage, "hp": role2.hp }] });

    }
}

@registerSkill
export class skill_1004 extends SkillBase {
    private checkTimer: NodeJS.Timer = null as any;
    private count = 0;
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    useSkill(info: I_useSkill) {
        let cfg = cfg_all().skill[this.skillId];

        this.skillMgr.setNowSkillId(this.skillId);

        let role = this.skillMgr.role;
        this.cd = nowSec() + cfg.cd;
        role.subMp(cfg.mpCost);

        this.sendMsg_useSkill({ "id": role.id, "skillId": this.skillId });

        this.count = 0;
        this.checkFunc();
        this.checkTimer = setInterval(this.checkFunc.bind(this), 500);
    }

    private checkFunc() {
        let cfg = cfg_all().skill[this.skillId];
        let role = this.skillMgr.role;
        let roleArr = role.map.getRolesAround(role, role, cfg.range, true);
        if (roleArr.length > 0) {
            let hurtArr: I_skillDataOne[] = []
            for (let one of roleArr) {
                let hurt = this.getHurt_m(cfg.damage, one);
                one.subHp(hurt, role.id);
                hurtArr.push({ "id": one.id, "hurt": hurt, "hp": one.hp });
            }
            this.sendMsg_skillAffect({ "id": role.id, "skillId": this.skillId, "data": hurtArr });
        }

        this.count++;
        if (this.count === 6) {
            this.skillOver();
        }
    }

    skillOver() {
        clearInterval(this.checkTimer);
        this.checkTimer = null as any;
        let role = this.skillMgr.role;
        this.sendMsg_skillOver({ "id": role.id, "skillId": this.skillId });
        this.skillMgr.setNowSkillId(0);
    }

    destroy() {
        clearInterval(this.checkTimer);
        this.checkTimer = null as any;
    }
}




@registerSkill
export class skill_1101 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    useSkill(info: I_useSkill) {
        let cfg = cfg_all().skill[this.skillId];

        let role = this.skillMgr.role;
        this.cd = nowSec() + cfg.cd;
        role.subMp(cfg.mpCost);

        let role2 = role.map.getEntity<Role>(info.id);
        let hurt = this.getHurt_p(role.attack, role2);

        this.sendMsg_useSkill({ "id": role.id, "skillId": this.skillId, "id2": role2.id });

        setTimeout(() => {
            role2 = role.map.getEntity<Role>(info.id);
            if (role2 && !role2.isDie()) {
                role2.subHp(hurt, role.id);
                role2.map.sendMsgByAOI(role2, cmd.onSomeHurt, { "arr": [{ "id": role2.id, "hurt": hurt, "hp": role2.hp }] })
            }
        }, 0.2)
    }
}

@registerSkill
export class skill_1102 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    useSkill(info: I_useSkill) {
        let cfg = cfg_all().skill[this.skillId];

        let role = this.skillMgr.role;
        this.cd = nowSec() + cfg.cd;
        role.subMp(cfg.mpCost);

        let role2 = role.map.getEntity<Role>(info.id);

        let roleArr = role.map.getRolesAround(role2, role, cfg.range, false);
        let addHpArr: I_skillDataOne[] = [];
        for (let one of roleArr) {
            one.addHp(cfg.damage);
            addHpArr.push({ "id": one.id, "hurt": cfg.damage, "hp": one.hp });
        }

        this.sendMsg_useSkill({ "id": role.id, "skillId": this.skillId, "id2": role2.id, "data": addHpArr });
    }
}



@registerSkill
export class skill_1103 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr);
    }

    useSkill(info: I_useSkill) {
        let cfg = cfg_all().skill[this.skillId];

        let role = this.skillMgr.role;
        this.cd = nowSec() + cfg.cd;
        role.subMp(cfg.mpCost);


        this.sendMsg_useSkill({ "id": role.id, "skillId": this.skillId, "id2": info.id });

        setTimeout(() => {
            let role2 = role.map.getEntity<Role>(info.id);
            if (!role2 || role2.isDie()) {
                return;
            }
            let roleArr = role.map.getRolesAround(role2, role, cfg.range, true);
            let hurtArr: I_skillDataOne[] = [];
            for (let one of roleArr) {
                let hurt = this.getHurt_m(cfg.damage, one);
                one.subHp(hurt, role.id);
                one.buffMgr.addBuff(1);
                hurtArr.push({ "id": one.id, "hurt": hurt, "hp": one.hp });
            }
            role2.map.sendMsgByAOI(role2, cmd.onSomeHurt, { "arr": hurtArr });
        }, 0.2)
    }
}