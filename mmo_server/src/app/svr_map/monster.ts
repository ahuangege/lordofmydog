import { app } from "mydog";
import { cmd } from "../../config/cmd";
import { I_xy } from "../../servers/map/handler/main";
import { cfg_all } from "../common/configUtil";
import { gameLog } from "../common/logger";
import { getInfoId } from "../util/gameUtil";
import { getLen, getLen2, randArrElement, randBetween, randIntNum } from "../util/util";
import { Entity, Entity_type, I_entityJson } from "./entity";
import { j2x, j2x2, Map, x2j } from "./map";
import { Player } from "./player";
import { Role } from "./role";
import { E_skillTargetType } from "./skill/skillMgr";
import { I_stateData, StateMachine } from "./stateMachine";

const moveSpeed = 350;

/** 怪物 */
export class Monster extends Role {
    idId: number;
    monsterId: number;
    stateMachine: StateMachine<E_monsterState>;
    targetId: number;  // 敌人
    skillIds: number[]
    constructor(map: Map, idId: number) {
        let cfg = cfg_all().mapMonster[idId];
        super({ "map": map, "id": map.getId(), "t": Entity_type.monster, "x": j2x2(cfg.x), "y": j2x2(cfg.y) });
        this.idId = idId;
        this.monsterId = cfg.monsterId;
        this.targetId = 0;

        map.addEntity(this);
        map.towerAOI.addObj(this, this);

        this.stateMachine = new StateMachine();
        this.stateMachine.init([
            new Monster_idle(this),
            new Monster_move(this),
            new Monster_moveBack(this),
            new Monster_followEnemy(this),
            new Monster_attack(this),
            new Monster_die(this),
        ], E_monsterState.idle);

        this.initBaseCfg();

        let cfgMonster = cfg_all().monster[this.monsterId];
        this.skillIds = cfgMonster.skill;
        for (let id of cfgMonster.skill) {
            this.skillMgr.addSkill(id);
        }

    }

    private initBaseCfg() {
        let cfg = cfg_all().monster[this.monsterId];
        this.hpMax = cfg.hp;
        this.mpMax = cfg.mp;
        this.hp = this.hpMax;
        this.mp = this.mpMax;
        this.attack = cfg.attack;
        this.armor_p = 1 - cfg.armor_p / 100;
        this.armor_m = 1 - cfg.armor_m / 100;
        this.speed = moveSpeed;
    }

    /** 扣血 */
    subHp(num: number, roleId: number) {
        super.subHp(num, roleId);

        if (this.isDie()) {
            return;
        }
        if (!this.targetId) {
            this.targetId = roleId;
            this.stateMachine.toState(E_monsterState.attack);
        }
    }

    die(roleId: number) {
        super.die(roleId);
        this.skillMgr.skillOver();
        this.buffMgr.buffOverAll();

        this.stateMachine.toState(E_monsterState.die);
        process.nextTick(() => {    // 先发扣血消息，后发死亡消息
            this.map.towerAOI.removeObj(this);
        });

        this.sendAward(roleId);
    }

    private sendAward(roleId: number) {
        let cfg = cfg_all().monster[this.monsterId];
        let x = Math.floor(this.x);
        let y = Math.floor(this.y);
        let items: { "itemId": number, "num": number, "x": number, "y": number, "time": number }[] = [];
        for (let one of cfg.items) {
            if (randIntNum(100) < one[0]) {
                x = this.map.limitX(randBetween(x - 80, x + 80));
                y = this.map.limitY(randBetween(y - 80, y + 80));
                items.push({ "itemId": one[1], "num": one[2], "x": x, "y": y, "time": 20 });
            }
        }
        if (items.length) {
            this.map.createItem(items);
        }

        let player = this.map.getEntity<Player>(roleId);
        if (player && player.t === Entity_type.player) {
            app.rpc(getInfoId(player.uid)).info.map.addExp(player.uid, cfg.exp);
        }
    }

    revive() {
        this.targetId = 0;
        this.hp = this.hpMax;
        this.mp = this.mpMax;
        this.path.length = 0;
        this.stateMachine.toState(E_monsterState.idle);

        let map = this.map;
        map.towerAOI.addObj(this, this);
    }




    update(dt: number): void {
        super.update(dt);
        this.stateMachine.update(dt);
    }

    findPath(xyNow: I_xy, x2: number, y2: number) {
        let path = this.map.pathFind.findPath(xyNow.x, xyNow.y, x2, y2);
        if (!path) {
            return null;
        }
        if (path.length === 0) {  // 周围被堵住，或者是当前格子
            return null;
        }
        // 同一条直线上的点，去除中间的点，只保留两端的关键点
        for (let i = 2; i < path.length;) {
            let dx1 = path[i].x - path[i - 1].x;
            let dy1 = path[i].y - path[i - 1].y;
            let dx2 = path[i - 1].x - path[i - 2].x;
            let dy2 = path[i - 1].y - path[i - 2].y;
            if (dx1 * dy2 === dx2 * dy1) {  // 即 dx1 / dy1 = dx2 / dy2
                path.splice(i - 1, 1);
            } else {
                i++;
            }
        }

        let endPath: I_xy[] = [];
        for (let one of path) {
            endPath.push({
                "x": j2x(one.x),
                "y": j2x(one.y)
            });
        }
        return endPath;
    }




    toJson(): I_monsterJson {
        return {
            "id": this.id,
            "t": this.t,
            "x": Math.floor(this.x),
            "y": Math.floor(this.y),
            "monsterId": this.monsterId,
            "path": this.path,
            "hp": this.hp,
        }
    }

}

export interface I_monsterJson {
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    monsterId: number;
    path: I_xy[];
    hp: number;
}

/** 怪物状态 */
export const enum E_monsterState {
    idle,   // 空闲待机
    move,   // 巡逻
    moveBack,   // 回到原点（追赶敌人过远后）
    followEnemy,    // 追赶敌人
    attack,     // 攻击敌人
    die,        // 死亡
}

class Monster_idle implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.idle;
    monster: Monster;
    idleTime = 0;
    constructor(monster: Monster) {
        this.monster = monster;
        this.idleTime = randBetween(10, 20);
    }

    onEnter(lastState: E_monsterState) {
        this.idleTime = randBetween(10, 20);
    }

    update(dt: number) {
        this.idleTime -= dt;
        if (this.idleTime <= 0) {
            this.monster.stateMachine.toState(E_monsterState.move);
        }
    }

}

class Monster_move implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.move;
    monster: Monster;
    constructor(monster: Monster) {
        this.monster = monster;
    }

    onEnter(lastState: E_monsterState) {
        this.move();
    }

    private move() {
        if (!this.monster.buffMgr.canMove()) {
            return;
        }
        let cfg = cfg_all().mapMonster[this.monster.idId];
        let xyNow: I_xy = { "x": x2j(this.monster.x), "y": x2j(this.monster.y) };
        let x2 = 0;
        let y2 = 0;
        // 移动到离当前点更远的巡逻位置
        if (getLen2(xyNow, { "x": cfg.x * 2, "y": cfg.y * 2 }) > getLen2(xyNow, { "x": cfg.x2 * 2, "y": cfg.y2 * 2 })) {
            x2 = cfg.x * 2;
            y2 = cfg.y * 2;
        } else {
            x2 = cfg.x2 * 2;
            y2 = cfg.y2 * 2;
        }
        let path = this.monster.findPath(xyNow, x2, y2);
        if (path) {
            this.monster.path = path;
            this.monster.map.sendMsgByAOI(this.monster, cmd.onMove, { "id": this.monster.id, "path": path });
        }
    }

    update(dt: number) {
        if (this.monster.path.length === 0) { // 上次巡逻完后，可空闲，可继续巡逻
            if (Math.random() < 0.7) {
                this.monster.stateMachine.toState(E_monsterState.idle);
            } else {
                this.move();
            }
        }
    }

}

class Monster_moveBack implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.moveBack;
    monster: Monster;
    constructor(monster: Monster) {
        this.monster = monster;
    }

    onEnter(lastState: E_monsterState) {
        this.move();
    }

    private move() {
        let cfg = cfg_all().mapMonster[this.monster.idId];
        let path = this.monster.findPath({ "x": x2j(this.monster.x), "y": x2j(this.monster.y) }, cfg.x * 2, cfg.y * 2);
        if (path) {
            this.monster.path = path;
            this.monster.map.sendMsgByAOI(this.monster, cmd.onMove, { "id": this.monster.id, "path": path });
        }
    }

    update(dt: number) {
        if (this.monster.path.length === 0) { // 上次巡逻完后，可空闲，可继续巡逻
            this.monster.stateMachine.toState(E_monsterState.idle);
        }
    }

}

class Monster_followEnemy implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.followEnemy;
    monster: Monster;
    private basePos: I_xy;
    private range2: number;
    constructor(monster: Monster) {
        this.monster = monster;
        let cfg = cfg_all().mapMonster[monster.idId];
        let cfgM = cfg_all().monster[monster.monsterId];
        this.basePos = { "x": j2x2(cfg.x), "y": j2x2(cfg.y) };
        this.range2 = cfgM.range * cfgM.range;
    }

    onEnter(lastState: E_monsterState) {
        if (getLen2(this.basePos, this.monster) > this.range2) {    // 超过追赶距离，回到原点
            this.monster.targetId = 0;
            this.monster.stateMachine.toState(E_monsterState.moveBack);
            return;
        }

        let target = this.monster.map.getEntity<Role>(this.monster.targetId);
        let path = this.monster.findPath({ "x": x2j(this.monster.x), "y": x2j(this.monster.y) }, x2j(target.x), x2j(target.y));
        if (path) {
            this.monster.path = path;
            this.monster.map.sendMsgByAOI(this.monster, cmd.onMove, { "id": this.monster.id, "path": path });
        }
    }


    update(dt: number) {
        if (this.monster.path.length === 0) {   // 追赶敌人完毕，进行攻击
            this.monster.stateMachine.toState(E_monsterState.attack);
        }
    }

}


class Monster_attack implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.attack;
    monster: Monster;
    nowSkillId = 0;
    attackTime = 0; // 怪物攻击cd

    constructor(monster: Monster) {
        this.monster = monster;
    }

    onEnter(lastState: E_monsterState) {
        this.attackTime = 0;
    }


    update(dt: number) {
        this.attackTime -= dt;
        if (this.attackTime <= 0) {
            this.checkAttack();
        }
    }

    /** 怪物准备攻击 */
    checkAttack() {
        let target = this.monster.map.getEntity<Role>(this.monster.targetId);
        if (!target || target.isDie()) {
            this.monster.targetId = 0;
            this.monster.stateMachine.toState(E_monsterState.idle);
            return;
        }
        if (!this.monster.buffMgr.canMove()) {
            this.attackTime = 2;
            return;
        }
        if (!this.monster.buffMgr.canUseSkill()) {
            this.attackTime = 2;
            return;
        }
        this.attackTime = randBetween(2, 8);
        this.monster.mp = 10000;
        this.monster.skillMgr.clearAllCd();

        this.nowSkillId = randArrElement(this.monster.skillIds);
        let cfg = cfg_all().skill[this.nowSkillId];
        if (cfg.targetType === E_skillTargetType.notEnemy) {    // 对非敌方释放
            this.monster.skillMgr.useSkill({ "skillId": this.nowSkillId, "id": this.monster.id, "x": 0, "y": 0 })
            return;
        }
        let len = 0;
        if (cfg.targetType === E_skillTargetType.enemy) {
            len = cfg.targetDistance;
        } else if (cfg.targetType === E_skillTargetType.floor) {
            len = cfg.targetDistance;
        } else {
            len = cfg.range || 100;
        }

        if (getLen2(this.monster, target) < len * len) {    // 小于施法距离，直接攻击
            this.monster.skillMgr.useSkill({ "skillId": this.nowSkillId, "id": target.id, "x": Math.floor(target.x), "y": Math.floor(target.y) })
        } else {
            this.monster.stateMachine.toState(E_monsterState.followEnemy);
        }

    }


}


class Monster_die implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.die;
    monster: Monster;
    reviveTime = 0;
    constructor(monster: Monster) {
        this.monster = monster;
    }

    onEnter(lastState: E_monsterState) {
        this.reviveTime = randBetween(10, 20);
    }

    update(dt: number) {
        this.reviveTime -= dt;
        if (this.reviveTime <= 0) {
            this.monster.revive();
        }
    }

}

