import { app, Session } from "mydog";
import { cfg_all } from "../../../app/common/configUtil";
import { E_lock } from "../../../app/svr_info/roleInfo";
import { RoleInfoMgr } from "../../../app/svr_info/roleInfoMgr";
import { svr_info } from "../../../app/svr_info/svr_info";
import { getBit, setBit } from "../../../app/util/util";





export default class Handler {


    gmCommit(msg: { str: string }, session: Session, next: Function) {
        let role = svr_info.roleInfoMgr.getRole(session.uid);

        let arr = msg.str.toLowerCase().split(" ");
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].trim();
        }
        let num = 0;
        switch (arr[0]) {
            case "additem":
                let itemId = parseInt(arr[1]) || 0;
                num = parseInt(arr[2]) || 1;
                if (cfg_all().item[itemId]) {
                    role.bag.addItem({ "id": itemId, "num": num });
                }
                break;
            case "addexp":
                num = parseInt(arr[1]) || 1;
                role.addExp(num);
                break;
            default:
                break;
        }
    }

    /** 学习技能 */
    learnSkill(msg: { skillId: number }, session: Session, next: Function) {
        msg.skillId = Math.floor(msg.skillId) || 0;

        let role = svr_info.roleInfoMgr.getRole(session.uid);
        let cfg = cfg_all().hero[role.role.heroId];
        let index = cfg.skill.indexOf(msg.skillId);
        if (index === -1) {   // 该英雄没有技能
            return;
        }
        if (role.role.learnedSkill.includes(msg.skillId)) {   // 已学习
            return next({ "code": 0, "skillId": msg.skillId });
        }
        if (role.role.level < cfg.skillUnlockLv[index]) { // 技能解锁等级不足
            return;
        }

        role.role.learnedSkill.push(msg.skillId);
        role.changeSqlKey("learnedSkill");
        next({ "code": 0, "skillId": msg.skillId });
    }

    /** 装备技能 */
    equipSkill(msg: { skillId: number, index: number }, session: Session, next: Function) {
        msg.skillId = Math.floor(msg.skillId) || 0;
        msg.index = Math.floor(msg.index) || 0;
        if (msg.index !== 0 && msg.index !== 1 && msg.index !== 2) {
            return;
        }
        let role = svr_info.roleInfoMgr.getRole(session.uid);
        if (!role.role.learnedSkill.includes(msg.skillId)) {   // 未学习
            return;
        }
        let skillPos = role.role.skillPos;
        let oldIndex = skillPos.indexOf(msg.skillId);
        if (oldIndex === msg.index) {
            return;
        }
        let skillChanged: { "index": number, "skillId": number }[] = [];
        if (oldIndex !== -1) {
            skillPos[oldIndex] = 0;
            skillChanged.push({ "index": oldIndex, "skillId": 0 });
        }
        skillPos[msg.index] = msg.skillId;
        skillChanged.push({ "index": msg.index, "skillId": msg.skillId });

        role.changeSqlKey("skillPos");
        next({ "code": 0, "skill": skillChanged });
    }
}