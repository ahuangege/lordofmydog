
import { cfg_all } from "../../common/configUtil";
import { getAngle, getPrefab } from "../../util/gameUtil";
import { MapMain } from "../mapMain";
import { DestroyNode } from "../other/destroyNode";
import { Role } from "../role";
import { I_onUseSkill, I_skillDataOne, registerSkill, SkillBase, SkillMgr } from "./skillMgr";

class skill_1001 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr, 1001);
    }


    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let role = this.skillMgr.role;
        role.playAnim("hero_attack");
        let data = info.data[0];
        let role2 = MapMain.instance.getEntity<Role>(data.id);
        role2.setHp(data.hp);
        MapMain.instance.showHurtNum(role2.node, data.hurt, true);

        let pos1 = { "x": role.node.x, "y": role.node.y };
        let pos2 = { "x": role2.node.x, "y": role2.node.y };

        getPrefab("effects/1001", (prefab) => {
            let node = cc.instantiate(prefab);
            node.parent = MapMain.instance.effectParent;
            node.x = pos1.x;
            node.y = pos1.y;
            node.angle = getAngle(pos1, pos2);
            cc.tween(node).to(0.3, pos2).call(() => {
                node.destroy();
            }).start();
        });
    }

}
registerSkill(skill_1001, 1001)


class skill_1002 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr, 1002);
    }

    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let role = this.skillMgr.role;
        role.path.length = 0;
        role.playAnim("hero_magic");

        cc.tween(role.node).to(0.1, { "x": info.x, "y": info.y }).start();

        let x = role.node.x;
        let y = role.node.y;
        getPrefab("effects/1002", (prefab) => {
            let node = cc.instantiate(prefab);
            node.parent = MapMain.instance.effectParent;
            node.x = x;
            node.y = y;
        });
        for (let one of info.data) {
            let role2 = MapMain.instance.getEntity<Role>(one.id);
            role2.setHp(one.hp);
            MapMain.instance.showHurtNum(role2.node, one.hurt, true);
        }
    }
}
registerSkill(skill_1002, 1002)

class skill_1003 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr, 1003);
    }

    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let role = this.skillMgr.role;
        role.playAnim("hero_magic");

        let data = info.data[0];
        let role2 = MapMain.instance.getEntity<Role>(data.id);
        role2.setHp(data.hp);
        MapMain.instance.showHurtNum(role2.node, data.hurt, false);

        let x = role2.node.x;
        let y = role2.node.y;
        getPrefab("effects/1003", (prefab) => {
            let node = cc.instantiate(prefab);
            node.parent = MapMain.instance.effectParent;
            node.x = x;
            node.y = y;
        });
    }
}
registerSkill(skill_1003, 1003)

class skill_1004 extends SkillBase {
    private animNode: cc.Node = null;
    constructor(skillMgr: SkillMgr) {
        super(skillMgr, 1004);
    }

    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let role = this.skillMgr.role;
        role.playAnim("hero_magic");
        getPrefab("effects/1004", (prefab) => {
            this.animNode = cc.instantiate(prefab);
            this.animNode.parent = role.node;
        });
    }

    skillAffect(msg: { "data": I_skillDataOne[] }) {
        for (let one of msg.data) {
            let role2 = MapMain.instance.getEntity<Role>(one.id);
            role2.setHp(one.hp);
            MapMain.instance.showHurtNum(role2.node, one.hurt, true);
        }
    }

    skillOver() {
        if (cc.isValid(this.animNode)) {
            this.animNode.destroy();
        }
    }
}
registerSkill(skill_1004, 1004)

class skill_1101 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr, 1101);
    }


    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let role = this.skillMgr.role;
        role.playAnim("hero_attack");

        let role2 = MapMain.instance.getEntity<Role>(info.id2);
        let pos1 = { "x": role.node.x, "y": role.node.y };
        let pos2 = { "x": role2.node.x, "y": role2.node.y };

        getPrefab("effects/1101", (prefab) => {
            let node = cc.instantiate(prefab);
            node.parent = MapMain.instance.effectParent;
            node.x = pos1.x;
            node.y = pos1.y;
            cc.tween(node).to(0.2, pos2).call(() => {
                node.destroy();
            }).start();
        });
    }

}
registerSkill(skill_1101, 1101)


class skill_1102 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr, 1102);
    }

    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let role = this.skillMgr.role;
        role.playAnim("hero_magic");

        for (let data of info.data) {
            let role2 = MapMain.instance.getEntity<Role>(data.id);
            role2.setHp(data.hp);
            MapMain.instance.showHurtNum(role2.node, data.hurt, false);
            let x = role2.node.x;
            let y = role2.node.y;
            getPrefab("effects/1003", (prefab) => {
                let node = cc.instantiate(prefab);
                node.parent = MapMain.instance.effectParent;
                node.x = x;
                node.y = y;
            });
        }


    }
}
registerSkill(skill_1102, 1102)


class skill_1103 extends SkillBase {
    constructor(skillMgr: SkillMgr) {
        super(skillMgr, 1103);
    }

    /** 使用技能 */
    useSkill(info: I_onUseSkill) {
        let cfg = cfg_all().skill[this.skillId];
        this.cd = cfg.cd;

        let role = this.skillMgr.role;
        role.playAnim("hero_magic");

        let role2 = MapMain.instance.getEntity<Role>(info.id2);

        let pos1 = { "x": role.node.x, "y": role.node.y };
        let pos2 = { "x": role2.node.x, "y": role2.node.y };
        getPrefab("effects/1103", (prefab) => {
            let node = cc.instantiate(prefab);
            node.parent = MapMain.instance.effectParent;
            node.x = pos1.x;
            node.y = pos1.y;
            node.width = 2 * cfg.range;
            node.height = 2 * cfg.range;
            cc.tween(node).to(0.2, pos2).call(() => {
                node.destroy();
            }).start();
        });

    }
}
registerSkill(skill_1103, 1103)

