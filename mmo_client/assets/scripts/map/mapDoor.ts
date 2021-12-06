// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../common/cmdClient";
import { cfg_all, I_cfg_mapDoor } from "../common/configUtil";
import { network } from "../common/network";
import { MapMain } from "./mapMain";

const { ccclass, property } = cc._decorator;

/** 传送门 */
@ccclass
export class MapDoor extends cc.Component {

    private doorId: number = 0;
    private mapId: number = 0;
    @property(cc.Node)
    imgNode: cc.Node = null;

    start() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            if (event.getButton() === cc.Event.EventMouse.BUTTON_RIGHT) {
                let p = MapMain.instance.mePlayer;
                if (!cc.isValid(p)) {
                    return;
                }
                if (cc.Vec2.distance(this.node, p.node) > 2 * 64) {
                    return;
                }
                network.sendMsg(cmd.map_main_changeMap, { "doorId": this.doorId });
            }

        });
    }

    init(cfg: I_cfg_mapDoor) {
        this.doorId = cfg.id;
        this.mapId = cfg.mapId2;
        this.node.x = cfg.x * 64 + 32;
        this.node.y = cfg.y * 64 + 32;
        let mapCfg = cfg_all().map[cfg.mapId2];
        this.node.getChildByName("mapName").getComponent(cc.Label).string = mapCfg.name;
    }

    update(dt: number) {
        this.imgNode.angle += 45 * dt;
    }

}
