// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export class DestroyNode extends cc.Component {

    @property(cc.Label)
    targetNode: cc.Node = null;

    start() {
        if (!this.targetNode) {
            this.targetNode = this.node;
        }
    }

    destroyTargetNode() {
        this.targetNode.destroy();
    }
}
