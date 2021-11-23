// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { MapMain } from "../mapMain";

const { ccclass, property } = cc._decorator;

/**
 * 玩家主界面底部的血量条，蓝量条
 */
@ccclass
export class HpMpNumPrefab extends cc.Component {

    @property(cc.Boolean)
    private isHp = true;
    @property(cc.ProgressBar)
    private numBar: cc.ProgressBar = null;
    @property(cc.Label)
    private numLabel: cc.Label = null;
    private num = 0;
    private numMax = 0;

    update() {
        if (this.isHp) {
            this.checkHp();
        } else {
            this.checkMp();
        }
    }

    private checkHp() {
        let meP = MapMain.instance.mePlayer;
        if (!meP) {
            return;
        }
        if (this.num === meP.hp && this.numMax === meP.hpMax) {
            return;
        }
        this.num = meP.hp;
        this.numMax = meP.hpMax;
        this.numLabel.string = this.num + " / " + this.numMax;
        this.numBar.progress = this.num / this.numMax;

    }
    private checkMp() {
        let meP = MapMain.instance.mePlayer;
        if (!meP) {
            return;
        }
        if (this.num === meP.mp && this.numMax === meP.mpMax) {
            return;
        }
        this.num = meP.mp;
        this.numMax = meP.mpMax;
        this.numLabel.string = this.num + " / " + this.numMax;
        this.numBar.progress = this.num / this.numMax;
    }
}
