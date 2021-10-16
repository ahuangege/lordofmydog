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
import { CameraFollow } from "./cameraFollow";
import { Entity, Entity_type, I_entityJson } from "./entity";
import { Pathfind } from "./pathFind";
import { I_playerJson, Player } from "./player";

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
    tiles: number[][] = [];
    private entities: Dic<Entity> = {};

    @property(cc.Node)
    private hintInfoNode: cc.Node = null;

    onLoad() {
        MapMain.instance = this;
    }

    start() {
        network.onClose(this.svr_onClose, this);
        network.addHandler(cmd.map_main_enterMap, this.svr_enterMapBack, this);
        network.addHandler(cmd.onEntityChange, this.svr_onEntityChanged, this);
        network.addHandler(cmd.onMove, this.svr_onMove, this);

        UIMgr.showPanel(uiPanel.gameMain);

        network.sendMsg(cmd.map_main_enterMap);
        this.tileLayer = this.tilemap.getLayer("obj");

        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            let tmpPos = this.cameraNode.getComponent(cc.Camera).getScreenToWorldPoint(event.getLocation());
            if (cc.isValid(this.mePlayer)) {
                let node = this.mePlayer.node;
                // let x1 = Math.floor(this.mePlayer.node.x / this.tileW);
                // let y1 = Math.floor(this.mePlayer.node.y / this.tileW);
                // let x2 = Math.floor(tmpPos.x / this.tileW);
                // let y2 = Math.floor(tmpPos.y / this.tileW);
                // let path = this.pathFind.findPath(x1, y1, x2, y2);
                // console.log(path.length)
                node.x = tmpPos.x;
                node.y = tmpPos.y;
                network.sendMsg(cmd.map_main_move, { "x": Math.floor(node.x), "y": Math.floor(node.y) });
            }
        });
    }

    update(dt) {
        network.readMsg();
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


    setHintInfo(info: string, pos: cc.Vec2) {
        if (info.length === 0) {
            this.hintInfoNode.active = false;
            return;
        }
        this.hintInfoNode.active = true;
        let label = this.hintInfoNode.children[0].getComponent(cc.RichText);
        label.string = info;
        this.hintInfoNode.height = label.node.height + 10;
        let localPos = this.hintInfoNode.parent.convertToNodeSpaceAR(pos);
        this.hintInfoNode.x = localPos.x;
        this.hintInfoNode.y = localPos.y;
        this.hintInfoNode.setSiblingIndex(this.hintInfoNode.parent.children.length);
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
