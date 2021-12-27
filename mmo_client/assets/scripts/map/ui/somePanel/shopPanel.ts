// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../../common/cmdClient";
import { cfg_all } from "../../../common/configUtil";
import { network } from "../../../common/network";
import { UIMgr } from "../../../common/uiMgr";
import { MapMain } from "../../mapMain";
import { ShopItemPrefab } from "./shopItemPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export class ShopPanel extends cc.Component {

    static instance: ShopPanel = null;

    @property(cc.Node)
    private shopItemParent: cc.Node = null;
    @property(cc.Prefab)
    private shopItemPrefab: cc.Prefab = null;
    private shopNode: cc.Node = null;

    private shopId: number = 0;
    onLoad() {
        ShopPanel.instance = this;
        network.addHandler(cmd.info_main_shopBuy, this.svr_onBuyBack, this);
    }

    init(shopId: number, node: cc.Node) {
        if (shopId === this.shopId) {
            return;
        }
        this.shopId = shopId;
        this.shopNode = node;
        
        let cfg = cfg_all().shopItem;
        for (let x in cfg) {
            if (cfg[x].shopId === shopId) {
                let node = cc.instantiate(this.shopItemPrefab);
                node.parent = this.shopItemParent;
                node.getComponent(ShopItemPrefab).init(cfg[x]);
            }
        }
    }

    update(dt: number) {
        if (cc.Vec2.distance(this.shopNode, MapMain.instance.mePlayer.node) > 350) {
            this.node.destroy();
        }
    }


    btn_close() {
        this.node.destroy();
    }

    private svr_onBuyBack(msg: { "code": number }) {
        if (msg.code === 0) {
            UIMgr.showTileInfo("购买成功");
        }
    }

    onDestroy() {
        network.removeThisHandlers(this);
        ShopPanel.instance = null;
    }
}
