import { svr_info } from "../../../app/svr_info/svr_info";
import { I_playerMapJson } from "../../map/handler/main";

export default class MapRemote {


    enterMap(uid: number, cb: (err: number, data: I_playerMapJson) => void) {
        let role = svr_info.roleInfoMgr.getRole(uid);
        if (!role) {
            return cb(0, null as any);
        }
        cb(0, role.toMapJson());

    }
}