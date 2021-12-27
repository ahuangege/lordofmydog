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
import { Player } from "../player";
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
    public skillArr: SkillPrefab[] = [];
    public hpPrefab: HpMpPrefab = null;
    public mpPrefab: HpMpPrefab = null;
    @property(cc.Label)
    private posLabel: cc.Label = null;
    @property(cc.Node)
    private matchNode: cc.Node = null;
    @property(cc.Node)
    private chatPrefab: cc.Node = null;
    @property(cc.Node)
    private chatParent: cc.Node = null;
    @property(cc.EditBox)
    private chatEdit: cc.EditBox = null;
    @property(cc.Label)
    private goldLabel: cc.Label = null;
    onLoad() {
        GameMainPanel.instance = this;
    }

    start() {
        network.addHandler(cmd.onItemChanged, this.svr_onItemChanged, this);
        network.addHandler(cmd.onEquipChanged, this.svr_onEquipChanged, this);
        network.addHandler(cmd.onHpMpPosChanged, this.svr_onHpMpPosChanged, this);
        network.addHandler(cmd.onLvExpChanged, this.svr_onLvExpChanged, this);
        network.addHandler(cmd.info_main_equipSkill, this.svr_equipSkillBack, this);
        network.addHandler(cmd.map_main_copyStartMatch, this.svr_startMatchBack, this);
        network.addHandler(cmd.map_main_copyCancelMatch, this.svr_cancelMatchBack, this);
        network.addHandler(cmd.onChatMap, this.svr_onChatMap, this);
        network.addHandler(cmd.onGoldChanged, this.svr_onGoldChanged, this);

        this.setLvExp(true);
        this.goldLabel.string = Game.roleInfo.gold.toString();

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

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
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

        if (cc.isValid(HeroInfoPanel.instance) && HeroInfoPanel.instance.entityId === MapMain.instance.meId) {
            HeroInfoPanel.instance.onHeroLvUp();
        }
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
    private svr_equipSkillBack(msg: { "code": number, "skill": { "index": number, "skillId": number }[], "addSkill": number, "delSkill": number }) {
        if (msg.code === 0) {
            for (let one of msg.skill) {
                Game.roleInfo.skillPos[one.index] = one.skillId;
                this.skillArr[one.index].init(one.skillId);
            }
            let player = MapMain.instance.mePlayer;
            if (msg.delSkill) {
                player.skillMgr.delSkill(msg.delSkill);
            }
            if (msg.addSkill) {
                player.skillMgr.addSkill(msg.addSkill);
            }
        }
    }

    btn_heroInfo() {
        InputKeyListen.instance.showPanel(E_keyType.heroInfo);
    }
    /** 设置当前地图的地图名 */
    setMapName(isCopy: number, mapName: string) {
        this.posLabel.node.parent.getChildByName("name").getComponent(cc.Label).string = isCopy ? mapName + "(副本)" : mapName;
    }
    /** 设置当前坐标 */
    setMapPos(x: number, y: number) {
        this.posLabel.string = "(" + x + "," + y + ")";
    }

    btn_cancelMatch() {
        network.sendMsg(cmd.map_main_copyCancelMatch);
    }

    private svr_startMatchBack(msg: { "code": number, "doorId": number }) {
        if (msg.code === 0) {
            let mapId = cfg_all().mapDoor[msg.doorId].mapId2;
            this.setMatchOk(true, cfg_all().map[mapId].name);
        } else {
            UIMgr.showErrcode(msg.code);
        }
    }
    private svr_cancelMatchBack(msg: { "code": number }) {
        if (msg.code === 0) {
            this.setMatchOk(false, "");
        }
    }

    /** 设置匹配状态 */
    setMatchOk(ok: boolean, mapName: string) {
        if (ok) {
            this.matchNode.active = true;
            this.matchNode.getChildByName("name").getComponent(cc.Label).string = "匹配中 [" + mapName + "]";
        } else {
            this.matchNode.active = false;
        }
    }

    chatEdit_enter() {
        this.scheduleOnce(() => {
            this.chatEdit.focus();
        }, 0.2);

        let str = this.chatEdit.string;
        if (str === "") {
            return;
        }
        this.chatEdit.string = "";
        network.sendMsg(cmd.map_main_chatMap, { "msg": str });
    }

    private svr_onChatMap(msg: { "id": number, "nickname": string, "msg": string }) {
        let node = cc.instantiate(this.chatPrefab);
        node.parent = this.chatParent;
        if (msg.id === MapMain.instance.meId) {
            node.getComponent(cc.RichText).string = "<color=green>" + msg.nickname + "</c>: " + msg.msg;
        } else {
            node.getComponent(cc.RichText).string = "<color=yellow>" + msg.nickname + "</c>: " + msg.msg;
        }
        if (this.chatParent.children.length > 10) {
            let arr = this.chatParent.children.slice(0, 5);
            for (let one of arr) {
                one.destroy();
            }
        }

        let p = MapMain.instance.getEntity<Player>(msg.id);
        p.chat(msg.msg);
    }

    private svr_onGoldChanged(msg: { "num": number }) {
        Game.roleInfo.gold = msg.num;
        this.goldLabel.string = msg.num.toString();
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        if (event.keyCode === cc.macro.KEY.enter) {
            this.chatEdit.focus();
        }
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        network.removeThisHandlers(this);
        GameMainPanel.instance = null;
    }
}
