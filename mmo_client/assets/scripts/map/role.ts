// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Entity } from "./entity";
import { MapMain } from "./mapMain";
import { BuffMgr } from "./other/buffMgr";
import { HurtNum } from "./other/hurtNum";
import { I_xy } from "./player";
import { SkillMgr } from "./skill/skillMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class Role extends Entity {

    public path: I_xy[] = [];
    protected dx = 0;
    protected dy = 0;
    protected pathTime = 0;
    protected moveSpeed = 0;

    skillMgr: SkillMgr;
    buffMgr: BuffMgr;

    hp: number = 0;
    hpMax: number = 0;
    mp: number = 0; // 蓝量 （只有玩家自己，会赋值）
    mpMax: number = 0;   // 蓝上限 （只有玩家自己，会赋值）

    @property(cc.Node)
    protected roleNode: cc.Node = null;
    @property(cc.ProgressBar)
    private bloodBar: cc.ProgressBar = null;
    @property(cc.Label)
    private bloodLabel: cc.Label = null;
    @property(cc.Animation)
    private anim: cc.Animation = null;
    @property(cc.Node)
    public buffParent: cc.Node = null;

    onLoad() {
        this.skillMgr = new SkillMgr(this);
        this.buffMgr = new BuffMgr(this);
    }

    /** 移动 */
    move(path: I_xy[]) {
        this.path = path;
        this.countPath();
    }

    private countPath() {
        let path = this.path;
        if (path.length === 0) {
            return;
        }
        let dx = path[0].x - this.node.x;
        let dy = path[0].y - this.node.y;
        let len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) {
            this.dx = 0;
            this.dy = 0;
            this.pathTime = 0;
        } else {
            this.dx = dx / len;
            this.dy = dy / len;
            this.pathTime = len / this.moveSpeed;
            this.roleNode.scaleX = this.dx > 0 ? 1 : -1;
        }

    }

    update(dt: number) {
        this.moveTick(dt);
    }

    private moveTick(dt: number) {
        if (this.path.length === 0) {
            return;
        }
        let dLen = this.moveSpeed * dt;
        this.node.x += this.dx * dLen;
        this.node.y += this.dy * dLen;
        this.pathTime -= dt;
        if (this.pathTime <= 0) {
            this.path.shift();
            this.countPath();
        }

    }
    setHp(num: number) {
        this.hp = num;
        this.refreshHpUi();
    }

    /** 刷新血量条 */
    public refreshHpUi() {
        this.bloodLabel.string = this.hp + " / " + this.hpMax;
        this.bloodBar.progress = this.hp / this.hpMax;
    }

    isDie() {
        return this.hp <= 0;
    }

    playAnim(animName: "hero_attack" | "hero_magic") {
        this.anim.play(animName);
    }
}
