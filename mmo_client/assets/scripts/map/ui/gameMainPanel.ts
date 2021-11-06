// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { cmd } from "../../common/cmdClient";
import { cfg_all } from "../../common/configUtil";
import { Game, I_bagItem } from "../../common/game";
import { network } from "../../common/network";
import { UIMgr, uiPanel } from "../../common/uiMgr";
import { E_itemT, removeFromArr } from "../../util/gameUtil";
import { MapMain } from "../mapMain";
import { BagPanel } from "./bagPanel";
import { EscGo } from "./escGo";
import { GmPanel } from "./gmPanel";
import { HeroInfoPanel } from "./heroInfoPanel";
import { HpMpPrefab } from "./hpMpPrefab";
import { E_keyType, InputKeyListen } from "./inputKeyListen";
import { SkillPanel } from "./skillPanel";
import { SkillPrefab } from "./skillPrefab";

const { ccclass, property } = cc._decorator;

@ccclass
export class GameMainPanel extends cc.Component {

    static instance: GameMainPanel = null;

    @property(cc.Node)
    private skillParentNode: cc.Node = null;
    private skillArr: SkillPrefab[] = [];
    private hpPrefab: HpMpPrefab = null;
    private mpPrefab: HpMpPrefab = null;

    onLoad() {
        GameMainPanel.instance = this;
    }

    start() {
        network.addHandler(cmd.onItemChanged, this.svr_onItemChanged, this);
        network.addHandler(cmd.onEquipChanged, this.svr_onEquipChanged, this);
        network.addHandler(cmd.onHpMpPosChanged, this.svr_onHpMpPosChanged, this);
        network.addHandler(cmd.onLvExpChanged, this.svr_onLvExpChanged, this);
        network.addHandler(cmd.info_main_equipSkill, this.svr_equipSkillBack, this);

        this.setLvExp(true);

        let children = this.skillParentNode.children;
        let skillPos = Game.roleInfo.skillPos;
        for (let i = 0; i < skillPos.length; i++) {
            this.skillArr[i] = children[i].getComponent(SkillPrefab);
            this.skillArr[i].index = i;
            this.skillArr[i].init(skillPos[i]);
        }
        this.hpPrefab = children[3].getComponent(HpMpPrefab);
        this.mpPrefab = children[4].getComponent(HpMpPrefab);
        this.hpPrefab.init(Game.roleInfo.hpPos);
        this.mpPrefab.init(Game.roleInfo.mpPos);

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
            equip.hp_add = msg.id;
        } else if (msg.t === E_itemT.mp_add) {
            equip.mp_add = msg.id;
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

    /** 等级经验变化 */
    private svr_onLvExpChanged(msg: { "lv": number, "exp": number }) {
        Game.roleInfo.level = msg.lv;
        Game.roleInfo.exp = msg.exp;
        this.setLvExp();
    }
    /** 等级经验ui修改 */
    private setLvExp(setName = false) {
        let node = cc.find("top_left/roleInfo", this.node);
        node.getChildByName("lv").getComponent(cc.Label).string = "Lv." + Game.roleInfo.level;
        let cfg = cfg_all().heroLv[Game.roleInfo.heroId];
        let expNeed = cfg[Game.roleInfo.level].exp;
        let bar = node.getChildByName("exp").getComponent(cc.ProgressBar);
        if (expNeed === -1) { // 满级了
            bar.progress = 1;
            bar.node.getChildByName("num").getComponent(cc.Label).string = "--";
        } else {
            bar.progress = Game.roleInfo.exp / expNeed;
            bar.node.getChildByName("num").getComponent(cc.Label).string = Game.roleInfo.exp + " / " + expNeed;
        }
        if (setName) {
            node.getChildByName("name").getComponent(cc.Label).string = Game.roleInfo.nickname;
        }
    }

    /** 技能使用栏，换了技能 */
    private svr_equipSkillBack(msg: { "code": number, "skill": { "index": number, "skillId": number }[] }) {
        if (msg.code === 0) {
            for (let one of msg.skill) {
                Game.roleInfo.skillPos[one.index] = one.skillId;
                this.skillArr[one.index].init(one.skillId);
            }
        }
    }

    btn_heroInfo() {
        InputKeyListen.instance.showPanel(E_keyType.heroInfo);
    }

    onDestroy() {
        network.removeThisHandlers(this);
        GameMainPanel.instance = null;
    }
}
