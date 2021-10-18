import { app, Session } from "mydog";
import { cfg_all } from "../../../app/common/configUtil";
import { E_lock } from "../../../app/svr_info/roleInfo";
import { RoleInfoMgr } from "../../../app/svr_info/roleInfoMgr";
import { svr_info } from "../../../app/svr_info/svr_info";
import { getBit, setBit } from "../../../app/util/util";





export default class Handler {


    gmCommit(msg: { str: string }, session: Session, next: Function) {
        let role = svr_info.roleInfoMgr.getRole(session.uid);

        let arr = msg.str.toLowerCase().split(" ");
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].trim();
        }
        if (arr[0] === "additem") {
            let itemId = parseInt(arr[1]) || 0;
            let num = parseInt(arr[2]) || 1;
            if (cfg_all().item[itemId]) {
                role.bag.addItem({ "id": itemId, "num": num });
            }
        }
    }

}