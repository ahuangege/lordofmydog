// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../../common/cmdClient";
import { cfg_all, I_cfg_shopItem } from "../../../common/configUtil";
import { Game } from "../../../common/game";
import { network } from "../../../common/network";
import { UIMgr } from "../../../common/uiMgr";
import { getItemHintInfo, getItemImg } from "../../../util/gameUtil";
import { MapMain } from "../../mapMain";

const { ccclass, property } = cc._decorator;

@ccclass
export class ShopItemPrefab extends cc.Component {

    private info: I_cfg_shopItem = null;

    start() {
        let imgNode = this.node.getChildByName("img");
        imgNode.on(cc.Node.EventType.MOUSE_ENTER, (event: cc.Event.EventMouse) => {
            if (!this.info) {
                return;
            }
            let pos = imgNode.convertToWorldSpaceAR(new cc.Vec2(imgNode.width / 2 - 10, imgNode.height / 2 - 10));
            MapMain.instance.setHintInfo(getItemHintInfo(this.info.itemId), pos, imgNode);
        });
        imgNode.on(cc.Node.EventType.MOUSE_LEAVE, (event: cc.Event.EventMouse) => {
            if (!this.info) {
                return;
            }
            MapMain.instance.setHintInfo("", null, null);
        });
    }

    init(one: I_cfg_shopItem) {
        this.info = one;
        this.node.getChildByName("price").getComponent(cc.Label).string = one.gold.toString();
        getItemImg(one.itemId, (img) => {
            if (cc.isValid(this)) {
                this.node.getChildByName("img").getComponent(cc.Sprite).spriteFrame = img;
            }
        });
    }

    btn_buy() {
        if (Game.roleInfo.gold < this.info.gold) {
            return UIMgr.showTileInfo("金币不足");
        }
        network.sendMsg(cmd.info_main_shopBuy, { "shopItemId": this.info.id });
    }
}
