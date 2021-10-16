// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export class CameraFollow extends cc.Component {

    static instance: CameraFollow = null;
    private target: cc.Node = null;
    @property
    private smoothSpeed = 5;

    onLoad() {
        CameraFollow.instance = this;
    }

    setTarget(node: cc.Node) {
        this.target = node;
    }

    lateUpdate(dt) {
        if (cc.isValid(this.target)) {
            let t = this.smoothSpeed * dt;
            this.node.x = cc.misc.lerp(this.node.x, this.target.x, t);
            this.node.y = cc.misc.lerp(this.node.y, this.target.y, t);
        }
    }

    onDestroy() {
        CameraFollow.instance = null;
    }
}
