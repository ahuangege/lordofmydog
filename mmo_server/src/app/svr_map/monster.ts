import { I_xy } from "../../servers/map/handler/main";
import { cfg_all } from "../common/configUtil";
import { Entity, Entity_type, I_entityJson } from "./entity";
import { j2x2, Map } from "./map";
import { Role } from "./role";
import { I_stateData, StateMachine } from "./stateMachine";

/** 怪物 */
export class Monster extends Role {
    idId: number;
    monsterId: number;

    constructor(map: Map, idId: number) {
        let cfg = cfg_all().mapMonster[idId];
        super({ "map": map, "id": map.getId(), "t": Entity_type.monster, "x": j2x2(cfg.x), "y": j2x2(cfg.y) });
        this.idId = idId;
        this.monsterId = cfg.monsterId;

        map.addEntity(this);
        map.towerAOI.addObj(this, this);
    }

    revive() {
        let map = this.map;
        map.addEntity(this);
        map.getEntityChangeMsg({ "addEntities": [this.toJson()] }, map.towerAOI.getWatchers(this));
        map.towerAOI.addObj(this, this);
    }

    init() {

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
    followEnemy,    // 追赶敌人
    attack,     // 攻击敌人
}

class Monster_idle implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.idle;

    onEnter(lastState: E_monsterState) {

    }

    onExit(nextState: E_monsterState) {

    }

    update(dt: number) {

    }

}

class Monster_move implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.move;

    onEnter(lastState: E_monsterState) {

    }

    onExit(nextState: E_monsterState) {

    }

    update(dt: number) {

    }

}


class Monster_followEnemy implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.followEnemy;

    onEnter(lastState: E_monsterState) {

    }

    onExit(nextState: E_monsterState) {

    }

    update(dt: number) {

    }

}


class Monster_attack implements I_stateData<E_monsterState> {
    state: E_monsterState = E_monsterState.attack;

    onEnter(lastState: E_monsterState) {

    }

    onExit(nextState: E_monsterState) {

    }

    update(dt: number) {

    }

}

