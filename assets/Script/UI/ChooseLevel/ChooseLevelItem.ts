// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Button } from "../../Button";
import { Global } from "../../Global";
import LoadFactory from "../../util/LoadFactory";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChooseLevelItem extends cc.Component {

    @property(cc.Node)
    node_show: cc.Node = null;

    @property(cc.Label)
    txt_level: cc.Label = null;

    @property(cc.Node)
    node_hide: cc.Node = null;

    private _level = 0;

    setIndex(index: number, level: number) {
        this._level = level;
        this.node_show.active = level < Global.userInfo.level;
        this.node_hide.active = level >= Global.userInfo.level;

        this.txt_level.string = `${index+1}`;

    }

    start () {

        this.node_show.getComponent(Button).onTouchEnd(()=>{
            Global.chooseLevel = this._level + 1;
            cc.director.loadScene("Game");
        });

        this.node_hide.getComponent(Button).onTouchEnd(()=>{
            LoadFactory.loadTipsPanel("Please unlock the previous level");
        });

    }

    // update (dt) {}
}
