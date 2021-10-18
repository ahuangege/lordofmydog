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
import { E_itemT } from "../../util/gameUtil";
import { MapMain } from "../mapMain";
import { BagPanel } from "./bagPanel";
import { GmPanel } from "./gmPanel";
import { HeroInfoPanel } from "./heroInfoPanel";
import { HpMpPrefab } from "./hpMpPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export class GameMainPanel extends cc.Component {

    static instance: GameMainPanel = null;

    @property(HpMpPrefab)
    private hpPrefab: HpMpPrefab = null;
    @property(HpMpPrefab)
    private mpPrefab: HpMpPrefab = null;

    onLoad() {
        GameMainPanel.instance = this;
    }

    start() {
        network.addHandler(cmd.onItemChanged, this.svr_onItemChanged, this);
        network.addHandler(cmd.onEquipChanged, this.svr_onEquipChanged, this);
        network.addHandler(cmd.onHpMpPosChanged, this.svr_onHpMpPosChanged, this);

        this.hpPrefab.init(Game.roleInfo.hpPos);
        this.mpPrefab.init(Game.roleInfo.mpPos);
    }


    btn_bag() {
        if (!cc.isValid(BagPanel.instance)) {
            UIMgr.showPanel(uiPanel.bagPanel);
        } else {
            BagPanel.instance.node.destroy();
        }
    }
    btn_hero() {
        if (!cc.isValid(HeroInfoPanel.instance)) {
            UIMgr.showPanel(uiPanel.heroInfoPanel, (err, node) => {
                if (err || !cc.isValid(this)) {
                    return;
                }
                HeroInfoPanel.instance.init(MapMain.instance.getEntity(MapMain.instance.meId));
            });
        } else {
            HeroInfoPanel.instance.node.destroy();
        }
    }

    btn_gm() {
        if (!cc.isValid(GmPanel.instance)) {
            UIMgr.showPanel(uiPanel.gmPanel);
        } else {
            GmPanel.instance.node.destroy();
        }
    }

    /** 背包变化 */
    private svr_onItemChanged(msg: I_bagItem[]) {
        let bag = Game.roleInfo.bag;

        for (let one of msg) {
            let item = Game.getItemByI(one.i);
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

    /** 装备变化 */
    private svr_onEquipChanged(msg: { "t": E_itemT, "id": number }) {
        let equip = Game.roleInfo.equip;

        if (msg.t === E_itemT.weapon) {
            equip.weapon = msg.id;
        } else if (msg.t === E_itemT.armor_physical) {
            equip.armor_physical = msg.id;
        } else if (msg.t === E_itemT.armor_magic) {
            equip.armor_magic = msg.id;
        } else if (msg.t === E_itemT.hp_add) {
            equip.hp = msg.id;
        } else if (msg.t === E_itemT.mp_add) {
            equip.mp = msg.id;
        }

        if (cc.isValid(HeroInfoPanel.instance) && HeroInfoPanel.instance.entityId === MapMain.instance.meId) {
            HeroInfoPanel.instance.onEquipChanged(msg);
        }
    }

    /** hp mp 快速使用栏 变化 */
    private svr_onHpMpPosChanged(msg: { "t": E_itemT, "id": number, "num": number }) {
        if (msg.t === E_itemT.hp) {
            Game.roleInfo.hpPos.id = msg.id;
            Game.roleInfo.hpPos.num = msg.num;
            this.hpPrefab.init(msg);
        } else if (msg.t === E_itemT.mp) {
            Game.roleInfo.mpPos.id = msg.id;
            Game.roleInfo.mpPos.num = msg.num;
            this.mpPrefab.init(msg);
        }
    }



    onDestroy() {
        network.removeThisHandlers(this);
        GameMainPanel.instance = null;
    }
}
