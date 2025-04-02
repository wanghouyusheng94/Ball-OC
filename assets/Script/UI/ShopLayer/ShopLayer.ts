// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Button } from "../../Button";
import List from "../../Component/List/List";
import ShopItem from "./ShopItem";
import GameEventType from "../../util/GameEventType";
import EventUtil from "../../util/EventUtils";
import { Global } from "../../Global";
import { StorageUtils } from "../../util/StorageUtils";
import { StorageName } from "../../GameData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShopLayer extends cc.Component {

    @property(List)
    list: List = null;

    @property(Button)
    btn_close: Button = null;
    
    @property(cc.Label)
    txt_gold: cc.Label = null;

    private _purchaseData: number[] = [1,3,6,9,12,15,18];

    protected onEnable(): void {
        EventUtil.on(GameEventType.BUY_ITEM, this.buyItem, this);
    }

    protected onDisable(): void {
        EventUtil.off(GameEventType.BUY_ITEM, this.buyItem, this);
    }

    buyItem(index: number) {
        console.log("购买", index);
        Global.userInfo.gold += index;
        this.refresh();
    }

    refresh() {
        this.txt_gold.string = `${Global.userInfo.gold}`;
        StorageUtils.setStorageJson(StorageName.userInfo, Global.userInfo);

    }

    start () {
        this.txt_gold.string = `${Global.userInfo.gold}`;
        this.list.numItems = this._purchaseData.length;
        this.btn_close.onTouchEnd(()=>{
            console.log("ckick");
            this.node.destroy();
        })
    }

    onListenRender(node: cc.Node, index: number) {
        let item = node.getComponent(ShopItem);
        item.setPurchaseData(index,this._purchaseData[index]);
    }

    // update (dt) {}
}
