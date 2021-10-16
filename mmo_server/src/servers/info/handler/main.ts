import { app, Session } from "mydog";
import { E_lock } from "../../../app/svr_info/roleInfo";
import { RoleInfoMgr } from "../../../app/svr_info/roleInfoMgr";
import { svr_info } from "../../../app/svr_info/svr_info";
import { getBit, setBit } from "../../../app/util/util";





export default class Handler {
    private roleInfoMgr: RoleInfoMgr;
    constructor() {
        this.roleInfoMgr = svr_info.roleInfoMgr;
    }


}