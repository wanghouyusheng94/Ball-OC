
import Bottle from "./Game/Bottle";
import { ConfigPath, StorageName, UIPath } from "./GameData";
import { Global } from "./Global";
import LoadFactory from "./util/LoadFactory";
import { StorageUtils } from "./util/StorageUtils";

const {ccclass, property} = cc._decorator;

type TConfig = {
    level: number,
    color: number[],
}

@ccclass
export default class GameManager extends cc.Component {


    @property(cc.Label)
    txt_label: cc.Label = null;

    private _configList: TConfig[] = [];

  


    // update (dt) {}
}
