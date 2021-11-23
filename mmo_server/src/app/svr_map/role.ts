
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
        this.buffMgr = new BuffMgr();
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



}

