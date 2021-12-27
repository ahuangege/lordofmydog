// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { I_cfg_shop } from "../../common/configUtil";
import { UIMgr, uiPanel } from "../../common/uiMgr";
import { MapMain } from "../mapMain";
import { ShopPanel } from "../ui/somePanel/shopPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class ShopPrefab extends cc.Component {


    private shopId: number = 0;

    start() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            if (event.getButton() === cc.Event.EventMouse.BUTTON_LEFT) {

                if (cc.Vec2.distance(this.node, MapMain.instance.mePlayer.node) > 250) {
                    return;
                }

                if (cc.isValid(ShopPanel.instance)) {
                    ShopPanel.instance.init(this.shopId, this.node);
                } else {
                    UIMgr.showPanel(uiPanel.shopPanel, (err, node) => {
                        if (err) {
                            return;
                        }
                        node.getComponent(ShopPanel).init(this.shopId, this.node);
                    });
                }
            }

        });
    }

    init(cfg: I_cfg_shop) {
        this.shopId = cfg.id;
        this.node.x = cfg.x * 64 + 32;
        this.node.y = cfg.y * 64 + 32;
        this.node.children[0].getComponent(cc.Label).string = cfg.name;
    }

    update(dt) { }
}
