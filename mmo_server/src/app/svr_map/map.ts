import { app, Application } from "mydog";
import { cmd } from "../../config/cmd";
import { I_xy } from "../../servers/map/handler/main";
import { cfg_all, getMapTileJson } from "../common/configUtil";
import { Dic, removeFromArr } from "../util/util";
import { Entity, Entity_type, I_entityJson } from "./entity";
import { Pathfind } from "./pathFind";
import { Player } from "./player";
import { svr_map } from "./svr_map";
import { TowerAOI } from "./towerAOI";




/** 场景地图 */
export class Map {
    app: Application;
    public isCopy: boolean = false; // 是否是副本
    public mapId: number;
    public mapIndex: number;
    public mapTiles: number[][];
    public width: number;
    public height: number;
    private towerWidth: number = 10;
    private towerHeight: number = 5;
    towerAOI: TowerAOI<Entity>;
    pathFind: Pathfind;
    private id: number = 1;
    private entities: Dic<Entity> = {};
    private players: Dic<Player> = {};

    private group: Dic<number[]> = {};
    private copyUids: number[] = [];    // 副本时，本地图进来的玩家
    private fps = 5;    // update 帧率

    constructor(mapId: number, mapIndex: number) {
        this.app = app;
        this.mapId = mapId;
        this.mapIndex = mapIndex;
        this.mapTiles = getMapTileJson(mapId);
        this.width = this.mapTiles[0].length * 32;
        this.height = this.mapTiles.length * 32;
        this.towerAOI = new TowerAOI({ width: this.width, height: this.height, towerWidth: this.towerWidth * 64, towerHeight: this.towerHeight * 64, range: 1 });
        this.addAOIEvent();
        svr_map.pathFindMgr.add(mapId);
        this.pathFind = svr_map.pathFindMgr.get(mapId);


        setInterval(this.update.bind(this), 1000 / this.fps);
    }

    isPlayerHere(mapId: number, uid: number) {
        if (this.mapId !== mapId) {
            return false;
        }
        if (cfg_all().map[this.mapId].isCopy && !this.copyUids.includes(uid)) {
            return false;
        }
        return true;
    }

    update() {
        let dt = 1 / this.fps;
        for (let x in this.entities) {
            this.entities[x].update(dt);
        }
    }

    getId() {
        return this.id++;
    }

    addEntity(entity: Entity) {
        this.entities[entity.id] = entity;
        if (entity.t === Entity_type.player) {
            this.players[(entity as any as Player).uid] = entity as any as Player;
        }
    }

    getEntity<T = Entity>(id: number): T {
        return this.entities[id] as any as T;
    }

    delEntity(entity: Entity) {
        delete this.entities[entity.id];
        if (entity.t === Entity_type.player) {
            delete this.players[(entity as any as Player).uid];
        }
    }

    getPlayer(uid: number) {
        return this.players[uid];
    }

    addOrDelUidsid(uid: number, sid: string, isAdd: boolean) {
        let group = this.group;
        if (isAdd) {
            if (!group[sid]) {
                group[sid] = [];
            }
            if (!group[sid].includes(uid)) {
                group[sid].push(uid);
            }
        } else {
            if (group[sid]) {
                removeFromArr(group[sid], uid);
                if (!group[sid].length) {
                    delete group[sid];
                }
            }
        }
    }

    getMsg(cmd: cmd, msg: any = null) {
        this.app.sendMsgByGroup(cmd, msg, this.group);
    }

    getEntityChangeMsg(msg: { "addEntities"?: I_entityJson[], "delEntities"?: number[] }, group: Dic<number[]>) {
        this.app.sendMsgByGroup(cmd.onEntityChange, msg, group);
    }

    private addAOIEvent() {
        // 实体位置更新，通知对应观察者
        this.towerAOI.on("updateObj", (entity, addWatchers, delWatchers) => {
            if (addWatchers) {
                this.getEntityChangeMsg({ "addEntities": [entity.toJson()] }, addWatchers);
            }
            if (delWatchers) {
                this.getEntityChangeMsg({ "delEntities": [entity.id] }, delWatchers);
            }
        });

        // 观察者区域更新，通知该观察者相关实体变更
        this.towerAOI.on('updateWatcher', (uidsid, addArr, delArr) => {
            let msg: { "addEntities"?: I_entityJson[], "delEntities"?: number[] } = {};
            if (addArr.length) {
                let addEntities: I_entityJson[] = [];
                for (let one of addArr) {
                    addEntities.push(one.toJson());
                }
                msg.addEntities = addEntities;
            }
            if (delArr.length) {
                let delEntities: number[] = [];
                for (let one of delArr) {
                    delEntities.push(one.id);
                }
                msg.delEntities = delEntities;
            }

            this.app.sendMsgByUidSid(cmd.onEntityChange, msg, [uidsid]);
        });
    }


    sendMsgByAOI(pos: I_xy, cmd: cmd, msg: any) {
        let group = this.towerAOI.getWatchers(pos);
        app.sendMsgByGroup(cmd, msg, group);

    }

    /** 判断点是否可行走 */
    isPosOk(pos: I_xy) {
        if (pos.x <= 0 || pos.x >= this.width || pos.y <= 0 || pos.y >= this.height) {
            return false;
        }
        return this.mapTiles[x2j(pos.y)][x2j(pos.x)] === 0;
    }


}


export function j2x(j: number) {
    return j * 32 + 16;
}

export function x2j(x: number) {
    return Math.floor(x / 32);
}


export interface I_newEntities {
    "players": I_newPlayerJson[],
    "items": I_newItemJson[]
}

export interface I_newPlayerJson {
    "id": number,
    "x": number,
    "y": number,
    "nickname": string,
    "uid": number,
    "path": { "x": number, "y": number }[],
    "speed": number,
}

export interface I_newItemJson {
    "id": number,
    "itemId": number,
    "num": number,
    "x": number,
    "y": number,
}

