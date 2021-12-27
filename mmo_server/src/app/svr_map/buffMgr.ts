import { cmd } from "../../config/cmd";
import { gameLog } from "../common/logger";
import { Dic } from "../util/util";
import { Role } from "./role";

/** buff实现集合 */
let buffConDic: Dic<typeof BuffBase> = {};

/**
 * buff注册（装饰器）
 */
function registerBuff(buffCon: typeof BuffBase) {
    // gameLog.debug("buff注册（装饰器）", buffCon.name.substring(5));
    buffConDic[buffCon.name.substring(5)] = buffCon;
}


/** buff管理 */
export class BuffMgr {
    public role: Role;  // 对应角色
    private buffDic: Dic<BuffBase> = {};
    public buffData: I_buffData = { "yunxuan": 0 };
    constructor(role: Role) {
        this.role = role;
    }

    /** 添加buff */
    addBuff(buffId: number) {
        if (this.buffDic[buffId]) {
            this.buffDic[buffId].refresh();
            return;
        }
        let buffCon = buffConDic[buffId];
        if (buffCon) {
            this.buffDic[buffId] = new buffCon(this);
        } else {
            gameLog.warn("没有buff实现", buffId)
        }
    }

    /** 删除buff */
    delBuff(buffId: number) {
        let buff = this.buffDic[buffId];
        if (buff) {
            delete this.buffDic[buffId];
            if (!buff.hasOver) {
                buff.buffOver();
            }
        }
    }

    buffOverAll() {
        for (let x in this.buffDic) {
            this.buffDic[x].buffOver();
        }
    }

    destroy() {
        for (let x in this.buffDic) {
            this.buffDic[x].destroy();
        }
    }


    addSub_yunxuan(isAdd: boolean) {
        if (isAdd) {
            let num = this.buffData[E_buffKey.yunxuan] || 0;
            this.buffData[E_buffKey.yunxuan] = num + 1;
            if (num === 0) {
                this.role.path.length = 0;
            }
        } else {
            this.buffData[E_buffKey.yunxuan]--;
        }
    }

    /** 当前能否使用技能 */
    canUseSkill() {
        return !this.buffData[E_buffKey.yunxuan];
    }

    canMove() {
        return !this.buffData[E_buffKey.yunxuan];
    }

}

interface I_buffData {
    [E_buffKey: string]: number,
}

/** 部分buff效果（只针对bool值） */
export const enum E_buffKey {
    yunxuan = 1,
}


/** buff基类 */
export class BuffBase {
    buffId: number;
    buffMgr: BuffMgr;
    hasOver = false;
    constructor(buffMgr: BuffMgr) {
        this.buffId = Number((this as Object).constructor.name.substring(5));
        this.buffMgr = buffMgr;
    }

    /** 同一个buff时，刷新逻辑 */
    refresh() {

    }

    /** buff结束 （需要广播给客户端） */
    buffOver() {
        this.hasOver = true;
        this.buffMgr.delBuff(this.buffId);
        let role = this.buffMgr.role;
        role.map.sendMsgByAOI(role, cmd.onBuffOver, { "id": role.id, "buffId": this.buffId });
    }

    /** 销毁（不需要广播给客户端） */
    destroy() {

    }

    /** 增加了buff（注意：目前buff并没有放在使用技能时一起下发，可根据需要自己修改） */
    sendMsg_addBuff() {
        let role = this.buffMgr.role;
        role.map.sendMsgByAOI(role, cmd.onAddBuff, { "id": role.id, "buffId": this.buffId });
    }
}

@registerBuff
class buff_1 extends BuffBase {
    timeout: NodeJS.Timeout = null as any;
    constructor(buffMgr: BuffMgr) {
        super(buffMgr);
        super.sendMsg_addBuff();
        this.refresh();

        this.buffMgr.addSub_yunxuan(true);
    }

    refresh() {
        if (this.timeout) {
            this.timeout.refresh();
        } else {
            this.timeout = setTimeout(this.over.bind(this), 3000);
        }
    }

    private over() {
        this.buffOver();
    }

    buffOver(): void {
        super.buffOver();
        this.buffMgr.addSub_yunxuan(false);
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null as any;
        }
    }

    destroy(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null as any;
        }
    }
}