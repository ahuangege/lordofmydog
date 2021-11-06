// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { getMapJson } from "../common/configUtil";
import { network } from "../common/network";
import { UIMgr, uiPanel } from "../common/uiMgr";
import { getItemImg, getSkillImg } from "../util/gameUtil";
import { CameraFollow } from "./cameraFollow";
import { Entity, Entity_type, I_entityJson } from "./entity";
import { Pathfind } from "./pathFind";
import { I_playerJson, I_xy, Player } from "./player";

const { ccclass, property } = cc._decorator;

@ccclass
export class MapMain extends cc.Component {

    static instance: MapMain = null;

    @property(cc.TiledMap)
    private tilemap: cc.TiledMap = null;
    private tileLayer: cc.TiledLayer = null;
    @property(cc.Prefab)
    private playerPrefab: cc.Prefab = null;
    @property(cc.Node)
    private cameraNode: cc.Node = null;
    private mePlayer: Player = null;
    pathFind: Pathfind = null;
    tileW = 64;
    tileW2 = this.tileW / 2;
    tiles: number[][] = [];
    private entities: Dic<Entity> = {};
    public meId: number = 0;

    @property(cc.Node)
    private hintInfoNode: cc.Node = null;
    private hintInfoTarget: any = null;
    @property(cc.Node)
    private dragImg: cc.Node = null;
    private dragTarget: cc.Node = null;

    onLoad() {
        MapMain.instance = this;
    }

    start() {
        this.setHintInfo("", null, null);
        this.setDragImg(E_dragType.item, 0, 0, null, null);

        network.onClose(this.svr_onClose, this);
        network.addHandler(cmd.map_main_enterMap, this.svr_enterMapBack, this);
        network.addHandler(cmd.onEntityChange, this.svr_onEntityChanged, this);
        network.addHandler(cmd.onMove, this.svr_onMove, this);

        UIMgr.showPanel(uiPanel.gameMain);

        network.sendMsg(cmd.map_main_enterMap);
        this.tileLayer = this.tilemap.getLayer("obj");

        this.node.on(cc.Node.EventType.MOUSE_UP, (event: cc.Event.EventMouse) => {
            if (event.getButton() !== cc.Event.EventMouse.BUTTON_RIGHT) {
                return;
            }
            let tmpPos = this.cameraNode.getComponent(cc.Camera).getScreenToWorldPoint(event.getLocation());
            if (cc.isValid(this.mePlayer)) {
                let meNode = this.mePlayer.node;
                let x1 = Math.floor(meNode.x / this.tileW);
                let y1 = Math.floor(meNode.y / this.tileW);
                let x2 = Math.floor(tmpPos.x / this.tileW);
                let y2 = Math.floor(tmpPos.y / this.tileW);
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
                    tmpPos.x = endTile.x * this.tileW + this.tileW2;
                    tmpPos.y = endTile.y * this.tileW + this.tileW2;
                } else {
                    path.pop();
                }
                let endPath: I_xy[] = [];
                for (let one of path) {
                    endPath.push({
                        "x": one.x * this.tileW + this.tileW2,
                        "y": one.y * this.tileW + this.tileW2
                    });
                }
                endPath.push({ "x": Math.floor(tmpPos.x), "y": Math.floor(tmpPos.y) });
                endPath.unshift({ "x": Math.floor(meNode.x), "y": Math.floor(meNode.y) });
                network.sendMsg(cmd.map_main_move, { "path": endPath });

                endPath.shift();
                this.mePlayer.move(endPath);
            }
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

    private svr_onOpen() {

    }

    private svr_enterMapBack(msg: { "code": number, "meId": number, "entities": I_entityJson[] }) {
        if (msg.code !== 0) {
            UIMgr.showErrcode(msg.code, false, () => {
                cc.director.loadScene("login")
            });
            return;
        }
        this.onAddEntities(msg.entities);

        this.meId = msg.meId;
        this.mePlayer = this.getEntity(msg.meId) as Player;
        CameraFollow.instance.setTarget(this.mePlayer.node);

        this.pathFind = new Pathfind();
        this.tiles = getMapJson(1);
        this.pathFind.init(getMapJson(1), { "maxSearch": 100 });
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

    getEntity(id: number) {
        return this.entities[id];
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

    private svr_onMove(msg: { "id": number, "x": number, "y": number }) {
        let entity = this.getEntity(msg.id);
        if (entity && entity.t === Entity_type.player) {
            entity.node.x = msg.x;
            entity.node.y = msg.y;
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