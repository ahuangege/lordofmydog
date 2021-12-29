
import { app } from "mydog";
import { cmd } from "../../config/cmd";
import { I_xy } from "../../servers/map/handler/main";
import { getLen, getLerpPos } from "../util/util";
import { BuffMgr } from "./buffMgr";
import { Entity, Entity_type, I_EntityInit } from "./entity";
import { Map } from "./map";
import { Player } from "./player";
import { SkillMgr } from "./skill/skillMgr";

/** 角色（如玩家、怪物） */
export abstract class Role extends Entity {
    hpMax = 0;  // 最大血量
    mpMax = 0;  // 最大蓝量
    hp = 0;     // 当前血量
    mp = 0;     // 当前蓝量
    attack = 0;     // 攻击力
    armor_p = 0;    // 物防
    armor_m = 0;    // 魔防
    speed = 0;  // 移动速度

    path: I_xy[] = [];   // 移动路径点
    skillMgr: SkillMgr; // 技能管理
    buffMgr: BuffMgr;   // buff 管理

    constructor(info: I_EntityInit) {
        super(info);
        this.skillMgr = new SkillMgr(this);
        this.buffMgr = new BuffMgr(this);
    }



    update(dt: number) {
        if (this.path.length > 0) {
            let moveDis = this.speed * dt;
            let oldPos = { "x": this.x, "y": this.y };

            let startPos: I_xy = oldPos;
            let endPos: I_xy = null as any;
            let i: number = 0;
            for (i = 0; i < this.path.length; i++) {
                let tmp_dis = getLen(startPos, this.path[i]);
                if (moveDis > tmp_dis) {
                    moveDis = moveDis - tmp_dis;
                    startPos = this.path[i];
                    endPos = startPos;
                } else {
                    endPos = getLerpPos(startPos, this.path[i], moveDis, tmp_dis);
                    break;
                }
            }
            this.path.splice(0, i);
            this.x = endPos.x;
            this.y = endPos.y;

            if (this.t === Entity_type.player) {
                this.map.towerAOI.updateWatcher(this as any as Player, oldPos, this);
            }
            this.map.towerAOI.updateObj(this, oldPos, this);
        }
    }

    changePos(x: number, y: number) {
        let oldPos = { "x": this.x, "y": this.y };
        this.x = x;
        this.y = y;

        if (this.t === Entity_type.player) {
            this.map.towerAOI.updateWatcher(this as any as Player, oldPos, this);
        }
        this.map.towerAOI.updateObj(this, oldPos, this);
    }



    getMsg(cmd: cmd, msg: any) {

    }

    /** 耗蓝 */
    subMp(num: number) {
        this.mp -= num;
        if (this.mp < 0) {
            this.mp = 0;
        }
        this.getMsg(cmd.onMpMaxChanged, { "mp": this.mp });
    }
    /** 加蓝 */
    addMp(num: number) {
        this.mp += num;
        if (this.mp > this.mpMax) {
            this.mp = this.mpMax;
        }
        this.getMsg(cmd.onMpMaxChanged, { "mp": this.mp });
    }
    /** 扣血 */
    subHp(num: number, roleId: number) {
        if (this.hp === 0) {
            return;
        }
        this.hp -= num;
        if (this.hp <= 0) {
            this.hp = 0;
            this.die(roleId);
        }
    }

    /** 加血 */
    addHp(num: number) {
        this.hp += num;
        if (this.hp > this.hpMax) {
            this.hp = this.hpMax;
        }
    }

    /** 死亡 */
    die(roleId: number) {
        this.hp = 0;
        this.path.length = 0;
    }

    isDie() {
        return this.hp <= 0;
    }


}

