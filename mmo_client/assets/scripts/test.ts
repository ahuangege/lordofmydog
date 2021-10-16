// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    private camera_ui: cc.Node = null;
    @property(cc.Node)
    private camera_main: cc.Node = null;
    @property(cc.TiledMap)
    private tilemap: cc.TiledMap = null;
    @property(cc.Node)
    private moveNode: cc.Node = null;
    private move2Pos: cc.Vec2 = cc.Vec2.ZERO;


    start() {



        let layer = this.tilemap.getLayer("obj");
        layer.addUserNode(this.moveNode);

        let canvasNode = this.camera_ui.parent;
        canvasNode.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            let tmpPos = this.camera_main.getComponent(cc.Camera).getScreenToWorldPoint(event.getLocation());
            this.move2Pos.x = tmpPos.x;
            this.move2Pos.y = tmpPos.y;
        });
    }

    lateUpdate(dt) {
        this.moveNode.x = this.move2Pos.x;
        this.moveNode.y = this.move2Pos.y;
        this.camera_main.x = this.moveNode.x;
        this.camera_main.y = this.moveNode.y;
    }
}
