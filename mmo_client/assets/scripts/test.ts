// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {




    start() {
        this.node.on(cc.Node.EventType.MOUSE_ENTER, (event: cc.Event.EventTouch) => {
            console.log("enter")
        });
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventTouch) => {
            console.log("down")

        });
        this.node.on(cc.Node.EventType.MOUSE_MOVE, (event: cc.Event.EventTouch) => {
            console.log("move")
        });

        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (event: cc.Event.EventTouch) => {
            console.log("leave")
        });
        this.node.on(cc.Node.EventType.MOUSE_UP, (event: cc.Event.EventTouch) => {
            console.log("up")
        });
        this.node.on(cc.Node.EventType.MOUSE_WHEEL, (event: cc.Event.EventTouch) => {
            console.log("wheel")
        });

    }


    lateUpdate(dt) {

    }
}
