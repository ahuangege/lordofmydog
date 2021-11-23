// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { E_localStorageType, Game } from "../../common/game";
import { UIMgr, uiPanel } from "../../common/uiMgr";
import { Dic, MapMain } from "../mapMain";
import { BagPanel } from "./bagPanel";
import { GameMainPanel } from "./gameMainPanel";
import { GmPanel } from "./gmPanel";
import { HeroInfoPanel } from "./heroInfoPanel";
import { SettingPanel } from "./settingPanel";
import { SkillPanel } from "./skillPanel";

const { ccclass, property } = cc._decorator;

/***
 * 快捷键监听管理（此demo方式为在此处集中管理）
 */
@ccclass
export class InputKeyListen extends cc.Component {
    static instance: InputKeyListen = null;

    private keyEvents: Dic<Function> = {};
    onLoad() {
        InputKeyListen.instance = this;
    }

    start() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        let keySetStr = Game.localStorage_getItem(E_localStorageType.keySet);
        if (keySetStr) {
            Game.keySet = JSON.parse(keySetStr);
        }
        this.refresh();
    }
    private onKeyDown(event: cc.Event.EventKeyboard) {
        let func = this.keyEvents[event.keyCode];
        if (func) {
            func.call(this);
        }

    }
    private on(key: string, cb: () => void) {
        if (this.keyEvents[key]) {
            return;
        }
        this.keyEvents[key] = cb;
    }

    /** 重新监听 */
    refresh() {
        this.keyEvents = {};

        let keySet = Game.keySet || defaultKeySet;
        let keyCode = keySet[E_keyType.bag];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_bag);
        }
        keyCode = keySet[E_keyType.heroInfo];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_heroInfo);
        }
        keyCode = keySet[E_keyType.skill];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_skill);
        }
        keyCode = keySet[E_keyType.gm];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_gm);
        }
        keyCode = keySet[E_keyType.setting];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_setting);
        }
        keyCode = keySet[E_keyType.skill_1];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_useSkill.bind(this, 0));
        }
        keyCode = keySet[E_keyType.skill_2];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_useSkill.bind(this, 1));
        }
        keyCode = keySet[E_keyType.skill_3];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_useSkill.bind(this, 2));
        }
        keyCode = keySet[E_keyType.add_hp];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_add_hp);
        }
        keyCode = keySet[E_keyType.add_mp];
        if (keyCode) {
            this.on(keySetValue[keyCode], this.func_add_mp);
        }
    }

    private func_bag() {
        this.showPanel(E_keyType.bag);
    }
    private func_heroInfo() {
        this.showPanel(E_keyType.heroInfo);
    }
    private func_skill() {
        this.showPanel(E_keyType.skill);
    }
    private func_gm() {
        this.showPanel(E_keyType.gm);
    }
    private func_setting() {
        this.showPanel(E_keyType.setting);
    }
    private func_useSkill(index: number) {
        GameMainPanel.instance.skillArr[index].btn_click();
    }
    private func_add_hp() {
        GameMainPanel.instance.hpPrefab.btn_click();
    }
    private func_add_mp() {
        GameMainPanel.instance.mpPrefab.btn_click();
    }



    showPanel(keyType: E_keyType) {
        switch (keyType) {
            case E_keyType.bag:
                if (!cc.isValid(BagPanel.instance)) {
                    UIMgr.showPanel(uiPanel.bagPanel);
                } else {
                    BagPanel.instance.node.destroy();
                }
                break;
            case E_keyType.heroInfo:
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
                break;
            case E_keyType.skill:
                if (!cc.isValid(SkillPanel.instance)) {
                    UIMgr.showPanel(uiPanel.skillPanel);
                } else {
                    SkillPanel.instance.node.destroy();
                }
                break;
            case E_keyType.gm:
                if (!cc.isValid(GmPanel.instance)) {
                    UIMgr.showPanel(uiPanel.gmPanel);
                } else {
                    GmPanel.instance.node.destroy();
                }
                break;
            case E_keyType.setting:
                if (!cc.isValid(SettingPanel.instance)) {
                    UIMgr.showPanel(uiPanel.settingPanel);
                } else {
                    SettingPanel.instance.node.destroy();
                }
                break;
            default:
                console.warn("no panel：", keyType);
                break;
        }
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        InputKeyListen.instance = null;
    }
}

/** 快捷键 （注意：此例中，快捷键和ui面板使用的是同一个枚举，然而他们间没有什么必然联系，建议分开成两个枚举）*/
export enum E_keyType {
    none = 0,
    bag = 1,    // 背包
    heroInfo = 2, //英雄信息
    skill = 3,  //技能面板
    gm = 4,     // gm面板
    skill_1 = 5,    // 技能1
    skill_2 = 6,    // 技能2
    skill_3 = 7,    // 技能3
    add_hp = 8,     // 快速加血栏
    add_mp = 9,     // 快速加蓝栏
    setting = 10,   // 设置面板
}

/** 按键对应值 */
export let keySetValue: Dic<string> = {
    [cc.macro.KEY.a]: "A",
    [cc.macro.KEY.b]: "B",
    [cc.macro.KEY.c]: "C",
    [cc.macro.KEY.d]: "D",
    [cc.macro.KEY.e]: "E",
    [cc.macro.KEY.f]: "F",
    [cc.macro.KEY.g]: "G",
    [cc.macro.KEY.h]: "H",
    [cc.macro.KEY.i]: "I",
    [cc.macro.KEY.j]: "J",
    [cc.macro.KEY.k]: "K",
    [cc.macro.KEY.l]: "L",
    [cc.macro.KEY.m]: "M",
    [cc.macro.KEY.n]: "N",
    [cc.macro.KEY.o]: "O",
    [cc.macro.KEY.p]: "P",
    [cc.macro.KEY.q]: "Q",
    [cc.macro.KEY.r]: "R",
    [cc.macro.KEY.s]: "S",
    [cc.macro.KEY.t]: "T",
    [cc.macro.KEY.u]: "U",
    [cc.macro.KEY.v]: "V",
    [cc.macro.KEY.w]: "W",
    [cc.macro.KEY.x]: "X",
    [cc.macro.KEY.y]: "Y",
    [cc.macro.KEY.z]: "Z",
    [cc.macro.KEY.space]: "SPACE",
    [cc.macro.KEY["0"]]: "0",
    [cc.macro.KEY["1"]]: "1",
    [cc.macro.KEY["2"]]: "2",
    [cc.macro.KEY["3"]]: "3",
    [cc.macro.KEY["4"]]: "4",
    [cc.macro.KEY["5"]]: "5",
    [cc.macro.KEY["6"]]: "6",
    [cc.macro.KEY["7"]]: "7",
    [cc.macro.KEY["8"]]: "8",
    [cc.macro.KEY["9"]]: "9",
};
for (let x in keySetValue) {
    keySetValue[keySetValue[x]] = x;
}

/** 默认快捷键设置 */
export let defaultKeySet = {
    [E_keyType.bag]: keySetValue[cc.macro.KEY.b],
    [E_keyType.heroInfo]: keySetValue[cc.macro.KEY.i],
    [E_keyType.skill]: keySetValue[cc.macro.KEY.k],
    [E_keyType.gm]: keySetValue[cc.macro.KEY.h],
    [E_keyType.skill_1]: keySetValue[cc.macro.KEY.space],
    [E_keyType.skill_2]: keySetValue[cc.macro.KEY.a],
    [E_keyType.skill_3]: keySetValue[cc.macro.KEY.f],
    [E_keyType.add_hp]: keySetValue[cc.macro.KEY["1"]],
    [E_keyType.add_mp]: keySetValue[cc.macro.KEY["2"]],
    [E_keyType.setting]: keySetValue[cc.macro.KEY.t],
}


