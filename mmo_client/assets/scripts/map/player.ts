import { UIMgr, uiPanel } from "../common/uiMgr";
import { Entity, Entity_type } from "./entity";
import { HeroInfoPanel } from "./ui/heroInfoPanel";

const { ccclass, property } = cc._decorator;

const moveSpeed = 280;

@ccclass
export class Player extends Entity {
    uid: number;
    heroId: number;
    nickname: string;
    private path: I_xy[] = [];
    private dx = 0;
    private dy = 0;
    private pathTime = 0;

    start() {
        this.node.on(cc.Node.EventType.MOUSE_DOWN, (event: cc.Event.EventMouse) => {
            if (event.getButton() !== cc.Event.EventMouse.BUTTON_MIDDLE) {
                return;
            }
            if (!cc.isValid(HeroInfoPanel.instance)) {
                UIMgr.showPanel(uiPanel.heroInfoPanel, (err, node) => {
                    if (err || !cc.isValid(this)) {
                        return;
                    }
                    HeroInfoPanel.instance.init(this);
                });
            } else {
                HeroInfoPanel.instance.init(this);
            }
        });
    }

    init(json: I_playerJson) {
        this.id = json.id;
        this.t = json.t;
        this.uid = json.id;
        this.heroId = json.heroId;
        this.nickname = json.nickname;
        this.node.getChildByName("name").getComponent(cc.Label).string = this.nickname;
    }

    /** 移动 */
    move(path: I_xy[]) {
        this.path = path;
        this.countPath();
    }

    private countPath() {
        let path = this.path;
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
            this.pathTime = len / moveSpeed;
        }

    }

    update(dt: number) {
        this.moveTick(dt);
    }

    private moveTick(dt: number) {
        if (this.path.length === 0) {
            return;
        }
        let dLen = moveSpeed * dt;
        this.node.x += this.dx * dLen;
        this.node.y += this.dy * dLen;
        this.pathTime -= dt;
        if (this.pathTime <= 0) {
            this.path.shift();
            if (this.path.length > 0) {
                this.countPath();
            }
        }

    }
}

export interface I_xy {
    x: number,
    y: number,
}

export interface I_playerJson {
    id: number;
    t: Entity_type;
    x: number;
    y: number;
    uid: number;
    heroId: number;
    nickname: string;
}