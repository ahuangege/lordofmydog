import { Session } from "mydog";
import { svr_info } from "../../../app/svr_info/svr_info";


export default class Handler {

    delItem(msg: { index: number }, session: Session, next: Function) {
        let role = svr_info.roleInfoMgr.getRole(session.uid);
        role.bag.delItem(msg.index);
    }

    dropItem(msg: { index: number }, session: Session, next: Function) {
        let role = svr_info.roleInfoMgr.getRole(session.uid);
        role.bag.dropItem(msg.index);
    }

    changePos(msg: { index1: number, index2: number }, session: Session, next: Function) {
        let role = svr_info.roleInfoMgr.getRole(session.uid);
        role.bag.changePos(msg);
    }
}