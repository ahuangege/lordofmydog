// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { cfg_all } from "../../common/configUtil";
import { Game, I_equipment } from "../../common/game";
import { network } from "../../common/network";
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

        network.addHandler(cmd.map_main_getPlayerInfo, this.svr_getPlayerInfoBack, this);
    }


    init(entity: Entity) {
        if (this.entityId === entity.id) {
            return;
        }
        this.entityId = entity.id;
        if (entity.t === Entity_type.player) {
            if (entity.id === MapMain.instance.meId) {
                this.showInfo(Game.roleInfo);
            } else {
                network.sendMsg(cmd.map_main_getPlayerInfo, { "id": entity.id });
            }
        }
    }

    private svr_getPlayerInfoBack(msg: any) {
        if (msg.id === this.entityId) {
            this.showInfo(msg);
        }
    }

    private showInfo(info: { "heroId": number, "level": number, "nickname": string, "equip": I_equipment }) {

        this.node.getChildByName("lv").getComponent(cc.Label).string = "Lv." + info.level;
        this.node.getChildByName("name").getComponent(cc.Label).string = info.nickname;

        let equip = info.equip;
        this.equipDic[E_itemT.weapon].init(equip.weapon);
        this.equipDic[E_itemT.armor_physical].init(equip.armor_physical);
        this.equipDic[E_itemT.armor_magic].init(equip.armor_magic);
        this.equipDic[E_itemT.hp_add].init(equip.hp_add);
        this.equipDic[E_itemT.mp_add].init(equip.mp_add);

        this.showHeroNum(info);
    }

    private showHeroNum(info: { "heroId": number, "level": number, "equip": I_equipment }) {
        let equip = info.equip;

        let cfgHeroLv = cfg_all().heroLv[info.heroId][info.level];
        let numStr = "";
        let num = cfgHeroLv.attack;
        if (equip.weapon !== 0) {
            num += cfg_all().item[equip.weapon].num;
        }
        numStr += num + "\n";

        num = cfgHeroLv.armor_p;
        if (equip.armor_physical !== 0) {
            num += cfg_all().item[equip.armor_physical].num;
        }
        numStr += num + "%\n";

        num = cfgHeroLv.armor_m;
        if (equip.armor_magic !== 0) {
            num += cfg_all().item[equip.armor_magic].num;
        }
        numStr += num + "%\n";

        num = cfgHeroLv.hp;
        if (equip.hp_add !== 0) {
            num += cfg_all().item[equip.hp_add].num;
        }
        numStr += num + "\n";

        num = cfgHeroLv.mp;
        if (equip.mp_add !== 0) {
            num += cfg_all().item[equip.mp_add].num;
        }
        numStr += num;
        this.node.getChildByName("num").getComponent(cc.Label).string = numStr;

        let lvUpStr = "";
        if (cfgHeroLv.exp === -1) {
            lvUpStr = "--\n--\n--\n--\n--";
        } else {
            let cfgHeroLvNext = cfg_all().heroLv[info.heroId][info.level + 1];
            lvUpStr = "+" + (cfgHeroLvNext.attack - cfgHeroLv.attack)
                + "\n+" + (cfgHeroLvNext.armor_p - cfgHeroLv.armor_p) + "%"
                + "\n+" + (cfgHeroLvNext.armor_m - cfgHeroLv.armor_m) + "%"
                + "\n+" + (cfgHeroLvNext.hp - cfgHeroLv.hp)
                + "\n+" + (cfgHeroLvNext.mp - cfgHeroLv.mp);
        }
        this.node.getChildByName("lvUp").getComponent(cc.Label).string = lvUpStr;
    }

    onEquipChanged(msg: { "t": E_itemT, "id": number }) {
        this.equipDic[msg.t].init(msg.id);
        this.showHeroNum(Game.roleInfo);
    }

    onHeroLvUp() {
        this.showHeroNum(Game.roleInfo);
    }

    btn_close() {
        this.node.destroy();
    }


    onDestroy() {
        network.removeThisHandlers(this);
        HeroInfoPanel.instance = null;
    }
}
