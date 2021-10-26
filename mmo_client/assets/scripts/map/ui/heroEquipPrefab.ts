// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { cfg_all } from "../../common/configUtil";
import { Game } from "../../common/game";
import { network } from "../../common/network";
import { E_itemT, GameEvent, getItemHintInfo, getItemImg } from "../../util/gameUtil";
import { MapMain } from "../mapMain";
import { BagPanel } from "./bagPanel";
import { HeroInfoPanel } from "./heroInfoPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class HeroEquipPrefab extends cc.Component {

    @property({ type: cc.Enum(E_itemT) })
    equipType: E_itemT = E_itemT.weapon;
    private id = 0;

    start() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, (event: cc.Event.EventMouse) => {
            if (!this.id) {
                return;
            }
            let pos = this.node.convertToWorldSpaceAR(new cc.Vec2(this.node.width / 2 - 10, this.node.height / 2 - 10));
            MapMain.instance.setHintInfo(getItemHintInfo(this.id), pos, this.node);
        });
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (event: cc.Event.EventMouse) => {
            if (!this.id) {
                return;
            }
            MapMain.instance.setHintInfo("", null, null);
        });

        cc.game.on(GameEvent.onBagItemDrop, this.onBagItemDrop, this);
    }

    init(id: number) {
        if (id === this.id) {
            return;
        }
        this.id = id;
        if (id === 0) {
            this.node.children[1].getComponent(cc.Sprite).spriteFrame = null;
        } else {
            getItemImg(id, (img) => {
                if (cc.isValid(this)) {
                    this.node.children[1].getComponent(cc.Sprite).spriteFrame = img;
                }
            });
        }
    }

    private onBagItemDrop(index: number, pos: cc.Vec2) {
        if (HeroInfoPanel.instance.entityId !== MapMain.instance.meId) {
            return;
        }
        let node = this.node;
        let localPos = node.convertToNodeSpaceAR(pos);

        let minX = -node.anchorX * node.width;
        let maxX = (1 - node.anchorX) * node.width;
        let minY = -node.anchorY * node.height;
        let maxY = (1 - node.anchorY) * node.height;
        if (localPos.x < minX || localPos.x > maxX || localPos.y < minY || localPos.y > maxY) {
            return;
        }
        let item = Game.getItemByI(index);
        if (!item) {
            return;
        }
        if (item.id === this.id) {
            return;
        }
        let cfg = cfg_all().item[item.id];
        if (cfg.type !== this.equipType) {
            return;
        }
        network.sendMsg(cmd.info_bag_equipItem, { "index": index, "t": this.equipType });
    }


    onDestroy() {
        cc.game.off(GameEvent.onBagItemDrop, this.onBagItemDrop, this);
    }
}
