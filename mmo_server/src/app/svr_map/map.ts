import { app, Application } from "mydog";
import { cmd } from "../../config/cmd";
import { I_xy } from "../../servers/map/handler/main";
import { cfg_all, getMapTileJson } from "../common/configUtil";
import { Dic, getLen2, removeFromArr } from "../util/util";
import { CopyMatch } from "./copyMatch";
import { Entity, Entity_type, I_EntityInit, I_entityJson } from "./entity";
import { Item } from "./item";
import { Monster } from "./monster";
import { Player } from "./player";
import { Role } from "./role";
import { svr_map } from "./svr_map";
// import { TowerAOI } from "./towerAOI";
import pathfind from "a-star-pathfind";
import { TowerAOI } from "tower-aoi";
import { I_uidsid } from "../common/someInterface";



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
    towerAOI: TowerAOI<Entity, Player>;
    pathFind: pathfind;
    private id: number = 1;
    private entities: Dic<Entity> = {};
    protected players: Dic<Player> = {};

    private group: Dic<number[]> = {};
    private fps = 5;    // update 帧率
    protected updateTimer: NodeJS.Timer;
    copyMatchDic: Dic<CopyMatch> = {}; // 本地图中的副本匹配入口

    constructor(mapId: number, mapIndex: number, copyUids: number[]) {
        this.app = app;
        this.mapId = mapId;
        this.mapIndex = mapIndex;
        this.mapTiles = getMapTileJson(mapId);
        this.width = this.mapTiles[0].length * 32;
        this.height = this.mapTiles.length * 32;
        this.towerAOI = new TowerAOI({ width: this.width, height: this.height, towerWidth: this.towerWidth * 32, towerHeight: this.towerHeight * 32, bufferNum: 0 });
        this.addAOIEvent();
        svr_map.pathFindMgr.add(mapId);
        this.pathFind = svr_map.pathFindMgr.get(mapId);

        for (let x in cfg_all().mapDoor) {
            let one = cfg_all().mapDoor[x];
            if (one.mapId === this.mapId && cfg_all().map[one.mapId2].isCopy) {
                this.copyMatchDic[one.id] = new CopyMatch(this, one.id);
            }
        }

        let monsterArr = cfg_all().mapId_monster[this.mapId] || [];
        for (let one of monsterArr) {
            new Monster(this, one.id);
        }

        this.updateTimer = setInterval(this.update.bind(this), 1000 / this.fps);
    }

    isPlayerHere(mapId: number, uid: number) {
        if (this.mapId !== mapId) {
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
    }

    getEntity<T = Entity>(id: number): T {
        return this.entities[id] as any as T;
    }

    delEntity(entity: Entity) {
        delete this.entities[entity.id];
    }

    playerIn(p: Player) {
        this.players[p.uid] = p;
    }

    playerLeave(p: Player) {
        delete this.players[p.uid];
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

    getEntityChangeMsg(msg: { "addEntities"?: I_entityJson[], "delEntities"?: number[] }, uidsid: I_uidsid[]) {
        this.app.sendMsgByUidSid(cmd.onEntityChange, msg, uidsid);
    }

    private addAOIEvent() {
        // 添加实体，通知对应观察者
        this.towerAOI.on("addObj", (obj, watchers) => {
            if (watchers.length) {
                this.getEntityChangeMsg({ "addEntities": [obj.toJson()] }, watchers);
            }
        });

        // 移除实体，通知对应观察者
        this.towerAOI.on("removeObj", (obj, watchers) => {
            if (watchers.length) {
                this.getEntityChangeMsg({ "delEntities": [obj.id] }, watchers);
            }
        });

        // 实体位置更新，通知对应观察者
        this.towerAOI.on("updateObj", (obj, addWatchers, removeWatchers) => {
            if (addWatchers.length) {
                this.getEntityChangeMsg({ "addEntities": [obj.toJson()] }, addWatchers);
            }
            if (removeWatchers.length) {
                this.getEntityChangeMsg({ "delEntities": [obj.id] }, removeWatchers);
            }
        });

        // 观察者区域更新，通知该观察者相关实体变更
        this.towerAOI.on('updateWatcher', (watcher, addObjs, removeObjs) => {
            let msg: { "addEntities"?: I_entityJson[], "delEntities"?: number[] } = {};
            if (addObjs.length) {
                let addEntities: I_entityJson[] = [];
                for (let one of addObjs) {
                    addEntities.push(one.toJson());
                }
                msg.addEntities = addEntities;
            }
            if (removeObjs.length) {
                let delEntities: number[] = [];
                for (let one of removeObjs) {
                    delEntities.push(one.id);
                }
                msg.delEntities = delEntities;
            }
            if (addObjs.length || removeObjs.length) {
                this.getEntityChangeMsg(msg, [watcher]);
            }
        });
    }


    sendMsgByAOI(entity: Entity, cmd: cmd, msg: any) {
        let watchers = this.towerAOI.getWatchers(entity);
        app.sendMsgByUidSid(cmd, msg, watchers);

    }

    /** 判断点是否可行走 */
    isPosOk(pos: I_xy) {
        if (pos.x <= 0 || pos.x >= this.width || pos.y <= 0 || pos.y >= this.height) {
            return false;
        }
        return this.mapTiles[x2j(pos.y)][x2j(pos.x)] === 0;
    }

    /** 生成道具 */
    createItem(items: { "itemId": number, "num": number, "x": number, "y": number, "time": number }[]) {
        for (let one of items) {
            (one as any as I_EntityInit).id = this.getId();
            (one as any as I_EntityInit).t = Entity_type.item;
            (one as any as I_EntityInit).map = this;
            let item = new Item(one.itemId, one.num, one.time, one as any as I_EntityInit);
            this.addEntity(item);
            this.towerAOI.addObj(item, item);
        }
    }

    /** x坐标限制 */
    limitX(x: number) {
        if (x <= 0) {
            x = 10;
        } else if (x >= this.width) {
            x = this.width - 10;
        }
        return x;
    }
    /** y坐标限制 */
    limitY(y: number) {
        if (y <= 0) {
            y = 10;
        } else if (y >= this.height) {
            y = this.height - 10;
        }
        return y;
    }


    /** 获取周围的角色 */
    getRolesAround(xy: I_xy, role: Role, range: number, isEnemy: boolean): Role[] {
        let entities = this.towerAOI.getObjsByPos(xy, range);
        let endRoles: Entity[] = [];
        for (let one of entities) {
            if (one.t !== Entity_type.monster && one.t !== Entity_type.player) {
                continue;
            }
            if ((one as Role).isDie()) {
                continue;
            }
            let tmpIsEnmey = this.isEnemy(role, one as Role);
            if (tmpIsEnmey === isEnemy && getLen2(xy, one) < (range + 60) * (range + 60)) {
                endRoles.push(one);
            }
        }
        return endRoles as Role[];
    }

    /** 判断是否是敌对关系 */
    isEnemy(role: Role, role2: Role) {
        if (role.t === Entity_type.player) {
            if (role2.t === Entity_type.monster) {
                return true;
            } else if (role === role2) {
                return false;
            } else {
                return true;
            }
        } else {
            if (role2.t === Entity_type.player) {
                return true;
            } else {
                return false;
            }
        }
    }
}


export function j2x(j: number) {
    return j * 32 + 16;
}
export function j2x2(j: number) {
    return j * 64 + 32;
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

