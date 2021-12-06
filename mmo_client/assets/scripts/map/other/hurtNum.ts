// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { randBetween } from "../../util/gameUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export class HurtNum extends cc.Component {

    @property(cc.Label)
    private label: cc.Label = null;
    private dx = 0;
    private dy = 0;
    private time = 0;

    init(num: number, isSub: boolean) {
        if (isSub) {
            this.label.string = "-" + num;
        } else {
            this.label.string = "+" + num;
            this.node.color = cc.Color.GREEN;
        }
        this.dx = randBetween(-100, 100);
        this.dy = randBetween(50, 100);
    }

    update(dt: number) {
        this.node.x += this.dx * dt;
        this.node.y += this.dy * dt;

        this.time += dt;
        if (this.time > 1.5) {
            this.node.destroy();
        }
    }


}
