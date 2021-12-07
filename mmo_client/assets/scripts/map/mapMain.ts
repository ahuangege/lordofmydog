// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { cfg_all, getMapJson, I_cfg_mapDoor } from "../common/configUtil";
import { Game } from "../common/game";
import { network } from "../common/network";
import { UIMgr, uiPanel } from "../common/uiMgr";
import { getItemImg, getSkillImg } from "../util/gameUtil";
import { CameraFollow } from "./cameraFollow";
import { Entity, Entity_type, I_entityJson } from "./entity";
import { MapDoor } from "./mapDoor";
import { HurtNum } from "./other/hurtNum";
import { Pathfind } from "./pathFind";
import { I_playerJson, I_xy, Player } from "./player";
import { Role } from "./role";
import { I_onUseSkill } from "./skill/skillMgr";
import { GameMainPanel } from "./ui/gameMainPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class MapMain extends cc.Component {

    static instance: MapMain = null;

    @property(cc.TiledMap)
    private tilemap: cc.TiledMap = null;
    private tileLayer: cc.TiledLayer = null;
    @property(cc.Prefab)
    private playerPrefab: cc.Prefab = null;
    @property(cc.Camera)
    private cameraMain: cc.Camera = null;
    public mePlayer: Player = null;
    pathFind: Pathfind = null;
    // tiles: number[][] = [];
    private entities: Dic<Entity> = {};
    public meId: number = 0;

    @property(cc.Node)
    private hintInfoNode: cc.Node = null;
    private hintInfoTarget: any = null;
    @property(cc.Node)
    private dragImg: cc.Node = null;
    private dragTarget: cc.Node = null;
    @property(cc.Prefab)
    private mapDoorPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    public hurtNumPrefab: cc.Prefab = null;
    @property(cc.Node)
    public hurtNumParent: cc.Node = null;

    onLoad() {
        MapMain.instance = this;
    }

    start() {
        this.setHintInfo("", null, null);
        this.setDragImg(E_dragType.item, 0, 0, null, null);
        UIMgr.showPanel(uiPanel.gameMain);

        network.onClose(this.svr_onClose, this);
        network.addHandler(cmd.onKicked, this.svr_onKicked, this);
        network.addHandler(cmd.map_main_enterMap, this.svr_enterMapBack, this);
        network.addHandler(cmd.onEntityChange, this.svr_onEntityChanged, this);
        network.addHandler(cmd.onMove, this.svr_onMove, this);
        network.addHandler(cmd.onHpMaxChanged, this.svr_onHpMaxChanged, this);
        network.addHandler(cmd.onMpMaxChanged, this.svr_onMpMaxChanged, this);
        network.addHandler(cmd.onChangeMap, this.svr_onChangeMap, this);
        network.addHandler(cmd.onUseSkill, this.svr_onUseSkill, this);
        network.addHandler(cmd.onSkillAffect, this.svr_onSkillAffect, this);
        network.addHandler(cmd.onSkillOver, this.svr_onSkillOver, this);
        network.addHandler(cmd.onUseHpFast, this.svr_onUseHpFast, this);

        cc.resources.load("map/map" + Game.mapId, cc.TiledMapAsset, (err, res: cc.TiledMapAsset) => {
            if (err) {
                return;
            }
            this.tilemap.tmxAsset = res;
            this.tileLayer = this.tilemap.getLayer("obj");
            let doorCfg = cfg_all().mapDoor;
            let doorArr: I_cfg_mapDoor[] = [];
            for (let x in doorCfg) {
                let one = doorCfg[x];
                if (one.mapId === Game.mapId) {
                    doorArr.push(one);
                }
            }
            for (let one of doorArr) {
                let node = cc.instantiate(this.mapDoorPrefab);
                this.tileLayer.addUserNode(node);
                node.getComponent(MapDoor).init(one);
            }

            // 加载完地图，请求服务器，进入地图
            network.sendMsg(cmd.map_main_enterMap);
        });



        this.node.on(cc.Node.EventType.MOUSE_UP, (event: cc.Event.EventMouse) => {
            if (event.getButton() !== cc.Event.EventMouse.BUTTON_RIGHT) {
                return;
            }
            if (!cc.isValid(this.mePlayer)) {
                return;
            }
            let tmpPos = this.screen2worldPoint(event.getLocation());
            let meNode = this.mePlayer.node;
            let x1 = Math.floor(meNode.x / 32);
            let y1 = Math.floor(meNode.y / 32);
            let x2 = Math.floor(tmpPos.x / 32);
            let y2 = Math.floor(tmpPos.y / 32);
            let path = this.pathFind.findPath(x1, y1, x2, y2);
            if (!path) {
                return;
            }
            let endTile = path[path.length - 1];
            if (path.length === 0) {  // 周围被堵住，或者是当前格子
                if (x1 !== x2 || y1 !== y2) {
                    return;
                }
            } else if (endTile.x !== x2 || endTile.y !== y2) {  // 未到达终点格子
                path.pop();
                tmpPos.x = endTile.x * 32 + 16;
                tmpPos.y = endTile.y * 32 + 16;
            } else {
                path.pop();
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
                    "x": one.x * 32 + 16,
                    "y": one.y * 32 + 16
                });
            }
            endPath.push({ "x": Math.floor(tmpPos.x), "y": Math.floor(tmpPos.y) });

            network.sendMsg(cmd.map_main_move, { "x": Math.floor(meNode.x), "y": Math.floor(meNode.y), "path": endPath });
            this.mePlayer.move(endPath);
        });
    }

    update(dt) {
        network.readMsg();
        if (this.hintInfoNode.active) {
            this.hintInfoNode.setSiblingIndex(-1);
            if (!cc.isValid(this.hintInfoTarget)) {
                this.setHintInfo("", null, null);
            }
        } else if (this.dragImg.active) {
            if (!cc.isValid(this.dragTarget)) {
                this.setDragImg(E_dragType.item, 0, 0, null, null);
            }
        }

    }

    private svr_onClose() {
        UIMgr.showSomeInfo("网络异常，请重新登录", false, () => {
            cc.director.loadScene("login")
        });
    }

    private svr_onKicked(msg: { code: number }) {
        network.disconnect();
        UIMgr.showErrcode(msg.code, false, () => {
            cc.director.loadScene("login");
        });
    }


    private svr_enterMapBack(msg: { "code": number, "mapId": number, "meId": number, "mp": number, "mpMax": number, "skillCd": number[], "entities": I_entityJson[] }) {
        if (msg.code !== 0) {
            UIMgr.showErrcode(msg.code, false, () => {
                cc.director.loadScene("login")
            });
            return;
        }
        this.onAddEntities(msg.entities);

        this.meId = msg.meId;
        this.mePlayer = this.getEntity(msg.meId) as Player;
        this.mePlayer.initSkill(Game.roleInfo.skillPos, msg.skillCd);
        this.mePlayer.mp = msg.mp;
        this.mePlayer.mpMax = msg.mpMax;

        CameraFollow.instance.setTarget(this.mePlayer.node);

        this.pathFind = new Pathfind();
        getMapJson(msg.mapId, (arr) => {
            if (arr) {
                this.pathFind.init(arr, { "maxSearch": 200 });
            }
        });
    }

    /** 新增实体 */
    private onAddEntities(entities: I_entityJson[]) {
        for (let one of entities) {
            switch (one.t) {
                case Entity_type.player:
                    let p = cc.instantiate(this.playerPrefab);
                    this.tileLayer.addUserNode(p);
                    p.x = one.x;
                    p.y = one.y;
                    let com = p.getComponent(Player);
                    com.init(one as I_playerJson);
                    this.addEntity(com);
                    break;
                default:
                    break;
            }
        }
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

    private svr_onEntityChanged(msg: { "addEntities"?: I_entityJson[], "delEntities"?: number[] }) {
        if (msg.addEntities) {
            this.onAddEntities(msg.addEntities);
        }
        if (!msg.delEntities) {
            return;
        }
        for (let id of msg.delEntities) {
            let entity = this.getEntity(id);
            if (!entity) {
                continue;
            }
            this.delEntity(entity);

            if (entity.t === Entity_type.player) {
                this.tileLayer.destroyUserNode(entity.node);
                entity.node.destroy();
            }
        }
    }

    private svr_onMove(msg: { "id": number, "path": I_xy[] }) {
        let entity = this.getEntity(msg.id);
        if (!entity) {
            return;
        }
        if (entity.t === Entity_type.player) {
            if (entity.id !== this.meId) {
                (entity as Player).move(msg.path);
            }
        }

    }


    setHintInfo(info: string, pos: cc.Vec2, target: cc.Node) {
        if (this.dragImg.active) {
            return;
        }
        if (info.length === 0) {
            this.hintInfoNode.active = false;
            this.hintInfoTarget = null;
            return;
        }
        this.hintInfoNode.active = true;
        this.hintInfoTarget = target;
        let label = this.hintInfoNode.children[0].getComponent(cc.RichText);
        label.string = info;
        this.hintInfoNode.height = label.node.height + 10;
        let localPos = this.hintInfoNode.parent.convertToNodeSpaceAR(pos);
        this.hintInfoNode.x = localPos.x;
        this.hintInfoNode.y = localPos.y;
    }

    setDragImg(dragType: E_dragType, id: number, num: number, pos: cc.Vec2, dragTarget: cc.Node) {
        if (id === 0) {
            this.dragImg.active = false;
            this.dragTarget = null;
            return;
        }
        if (this.hintInfoNode.active) {
            this.hintInfoNode.active = false;
        }
        this.dragImg.active = true;
        this.dragTarget = dragTarget;
        if (dragType === E_dragType.item) {
            getItemImg(id, (img) => {
                this.dragImg.getComponent(cc.Sprite).spriteFrame = img;
            });
        } else {
            getSkillImg(id, (img) => {
                this.dragImg.getComponent(cc.Sprite).spriteFrame = img;
            });
        }

        this.dragImg.children[0].getComponent(cc.Label).string = num === 1 ? "" : num.toString();
        this.setDragImgPos(pos);
        this.scheduleOnce(() => {
            this.dragImg.setSiblingIndex(-1);
        }, 0);
    }

    setDragImgPos(pos: cc.Vec2) {
        let localPos = this.node.convertToNodeSpaceAR(pos);
        this.dragImg.setPosition(localPos.x, localPos.y);
    }


    /** 玩家血上限变化了 */
    private svr_onHpMaxChanged(msg: { "id": number, "hpMax": number, "hp": number }) {
        let entity = this.getEntity(msg.id);
        if (!entity) {
            return;
        }
        if (entity.t === Entity_type.player) {
            (entity as Player).hp = msg.hp;
            (entity as Player).hpMax = msg.hpMax;
            (entity as Player).refreshHpUi();
        }
    }

    /** 玩家蓝上限变化了 */
    private svr_onMpMaxChanged(msg: { "mpMax": number, "mp": number }) {
        this.mePlayer.mp = msg.mp;
        if (msg.mpMax) {
            this.mePlayer.mpMax = msg.mpMax;
        }
    }

    screen2worldPoint(pos: cc.Vec2) {
        return this.cameraMain.getScreenToWorldPoint(pos) as any as cc.Vec2;
    }


    /** 通知，切换地图 */
    private svr_onChangeMap(msg: { "mapId": number }) {
        Game.mapId = msg.mapId;

        // 本demo为了方便，切换地图时，直接重新加载场景。实际应用中，请考虑更好的方式。
        cc.director.loadScene("map");
    }


    /** 通知，使用技能 */
    private svr_onUseSkill(msg: I_onUseSkill) {
        let role = this.getEntity<Role>(msg.id);
        role && role.skillMgr.useSkill(msg);
    }
    /** 通知，技能过程（针对持续性技能） */
    private svr_onSkillAffect(msg: { "id": number, "skillId": number, [key: string]: any }) {
        let role = this.getEntity<Role>(msg.id);
        role && role.skillMgr.skillAffect(msg);
    }

    /** 通知，技能结束（针对持续性技能） */
    private svr_onSkillOver(msg: { "id": number, "skillId": number }) {
        let role = this.getEntity<Role>(msg.id);
        role && role.skillMgr.skillOver(msg);
    }

    /** 通知，使用快速加血 */
    private svr_onUseHpFast(msg: { "id": number, "num": number, "hp": number }) {
        let role = this.getEntity<Role>(msg.id);
        if (role) {
            role.setHp(msg.hp);
            this.showHurtNum(role.node, msg.num, false);
        }
    }

    /** 展示伤害数字 */
    showHurtNum(nodeBase: cc.Node, num: number, isSub: boolean) {
        let node = cc.instantiate(this.hurtNumPrefab);
        node.parent = this.hurtNumParent;
        node.x = nodeBase.x;
        node.y = nodeBase.y + 128;
        node.getComponent(HurtNum).init(num, isSub);
    }


    onDestroy() {
        MapMain.instance = null;
        network.removeThisHandlers(this);
    }

}


export interface Dic<T = any> {
    [key: string]: T
}


export function j2x(j: number) {
    return j * 64 + 32;
}

export function x2j(x: number) {
    return Math.floor(x / 64);
}


export const enum E_dragType {
    item,
    skill,
}