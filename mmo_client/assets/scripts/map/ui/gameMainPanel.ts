// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { Game, I_bagItem } from "../../common/game";
import { network } from "../../common/network";
import { UIMgr, uiPanel } from "../../common/uiMgr";
import { BagPanel } from "./bagPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export class GameMainPanel extends cc.Component {

    static instance: GameMainPanel = null;
    onLoad() {
        GameMainPanel.instance = this;
    }

    start() {
        network.addHandler(cmd.onItemChanged, this.svr_onItemChanged, this)
    }


    btn_bag() {
        if (!cc.isValid(BagPanel.instance)) {
            UIMgr.showPanel(uiPanel.bagPanel);
        } else {
            BagPanel.instance.node.destroy();
        }
    }

    /** 背包变化 */
    private svr_onItemChanged(msg: I_bagItem[]) {
        let bag = Game.roleInfo.bag;
        function getItemByI(index: number) {
            for (let one of bag) {
                if (one.i === index) {
                    return one;
                }
            }
            return null;
        }
        for (let one of msg) {
            let item = getItemByI(one.i);
            if (!item) {
                item = one;
                bag.push(item);
            }
            item.id = one.id;
            item.num = one.num;
        }
        if (cc.isValid(BagPanel.instance)) {
            BagPanel.instance.onItemChanged(msg);
        }
    }


    onDestroy() {
        network.removeThisHandlers(this);
        GameMainPanel.instance = null;
    }
}
