// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Game, I_equipment } from "../../common/game";
import { E_itemT } from "../../util/gameUtil";
import { Entity, Entity_type } from "../entity";
import { Dic, MapMain } from "../mapMain";
import { HeroEquipPrefab } from "./heroEquipPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export class HeroInfoPanel extends cc.Component {

    static instance: HeroInfoPanel = null;
    entityId: number = 0;

    private equipDic: Dic<HeroEquipPrefab> = {};

    onLoad() {
        HeroInfoPanel.instance = this;

        let children = this.node.getChildByName("equips").children;
        for (let one of children) {
            let com = one.getComponent(HeroEquipPrefab);
            this.equipDic[com.equipType] = com;
        }
    }


    init(entity: Entity) {
        this.entityId = entity.id;
        if (entity.t === Entity_type.player) {
            if (entity.id === MapMain.instance.meId) {
                this.showInfo(Game.roleInfo);
            }
        }
    }

    private svr_getPlayerInfoBack() {

    }

    private showInfo(info: { "heroId": number, "level": number, "nickname": string, "equip": I_equipment }) {

        this.node.getChildByName("lv").getComponent(cc.Label).string = "LV" + info.level;
        this.node.getChildByName("name").getComponent(cc.Label).string = info.nickname;

        let equip = info.equip;
        this.equipDic[E_itemT.weapon].init(equip.weapon);
        this.equipDic[E_itemT.armor_physical].init(equip.armor_physical);
        this.equipDic[E_itemT.armor_magic].init(equip.armor_magic);
        this.equipDic[E_itemT.hp_add].init(equip.hp_add);
        this.equipDic[E_itemT.mp_add].init(equip.mp_add);
    }

    onEquipChanged(msg: { "t": E_itemT, "id": number }) {
        this.equipDic[msg.t].init(msg.id);
    }

    btn_close() {
        this.node.destroy();
    }


    onDestroy() {
        HeroInfoPanel.instance = null;
    }
}
