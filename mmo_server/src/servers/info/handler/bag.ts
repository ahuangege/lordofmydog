import { Session } from "mydog";
import { E_itemT } from "../../../app/svr_info/roleInfo";
import { svr_info } from "../../../app/svr_info/svr_info";


export default class Handler {

    /** 删除道具 */
    delItem(msg: { index: number }, session: Session, next: Function) {
        let role = svr_info.roleInfoMgr.getRole(session.uid);
        role.bag.delItem(msg.index);
    }

    /** 将道具扔地上 */
    dropItem(msg: { index: number }, session: Session, next: Function) {
        let role = svr_info.roleInfoMgr.getRole(session.uid);
        role.bag.dropItem(msg.index);
    }

    /** 道具换位置 */
    changePos(msg: { index1: number, index2: number }, session: Session, next: Function) {
        let role = svr_info.roleInfoMgr.getRole(session.uid);
        role.bag.changePos(msg);
    }

    /** 装备道具 */
    equipItem(msg: { index: number, t: E_itemT }, session: Session, next: Function) {
        let role = svr_info.roleInfoMgr.getRole(session.uid);
        role.bag.equipItem(msg);
    }
}