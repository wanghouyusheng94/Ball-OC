
import { Button } from "../../Button";
import List from "../../Component/List/List";
import { EClickAdsPos, StorageName } from "../../GameData";
import { Global } from "../../Global";
import Api from "../../Api/Api";
import EventUtil from "../../util/EventUtils";
import GameEventType from "../../util/GameEventType";
import { StorageUtils } from "../../util/StorageUtils";
import ChooseSkinItem from "./ChooseSkinItem";

const {ccclass, property} = cc._decorator;



// export type TSkinData = {
//     type: string,   // ball , bg, bottle
//     index: number,  // 
// }

export enum ESkinType {
    Ball = 'ball',
    Bottle = 'bottle',
    Bg = "bg",
}


@ccclass
export default class ChooseSkinLayer extends cc.Component {

    @property(cc.Node)
    node_layout: cc.Node = null;

    @property(Button)
    btn_close: Button = null;

    @property(List)
    list: List = null;

    @property(cc.Label)
    txt_gold: cc.Label = null;

    @property(cc.Node)
    node_panel: cc.Node = null;
    
    @property(Button)
    btn_lookAds: Button = null;

    @property(Button)
    btn_close2: Button = null;

    private _curIndex:number = null;;
    private _skinData: string[] = [];

    protected onLoad(): void {
        console.log("加载成功");
    }

    protected onEnable(): void {
        EventUtil.on(GameEventType.SHOW_ADS, this.showAds, this);
    }
    
    protected onDisable(): void {
        EventUtil.off(GameEventType.SHOW_ADS, this.showAds, this);
    }

    showAds() {
        if(Global.adsType == EClickAdsPos.goldUnlockSkin) {
            Global.userInfo.lookAdsNum--;
            this.node_panel.active = false;
            this.addGold();
        }
    }

    addGold() {
        Global.userInfo.gold+=20;
        this.refresh();
    }

    start () {
        this.node_layout.children.forEach((val,index)=>{
            val.getComponent(Button).onTouchEnd(()=>{
                this.chooseIndex(index);
            });
        });
        this.chooseIndex(0);
        this.txt_gold.string = `${Global.userInfo.gold}`;
        this.btn_close.onTouchEnd(()=>{
            this.node.destroy();
        });

        this.btn_lookAds.onTouchEnd(()=>{
            Global.adsType = EClickAdsPos.goldUnlockSkin;
            Api.showReward();
        });

        this.btn_close2.onTouchEnd(()=>{
            this.node_panel.active = false;
        })

    }

    chooseIndex(index: number) {

        if(index == this._curIndex) return;
        this._curIndex = index;

        this.node_layout.children.forEach((val,_index)=>{
            val.getChildByName("choose").active = index == _index;
        })

        this.setSkinData(index);        
    }

    setSkinData(index) {
        // if(index == 0) this._skinData = Global.userInfo.unlockBall;
        // else if(index == 1) this._skinData = Global.userInfo.unlockBottle;
        // else if(index == 2) this._skinData = Global.userInfo.unlockBg;
        this.list.numItems = 10;
    }

    openPanel() {
        this.node_panel.active = true;
        cc.tween(this.node_panel.getChildByName("bg"))
        .set({scale:0})
        .to(0.2,{scale:1}, {easing:"backOut"})
        .start();
    }


    onListenRender(node: cc.Node, index: number) {
        node.getComponent(ChooseSkinItem).refreshShow(this._curIndex,index, this);
    }

    refresh() {
        this.setSkinData(this._curIndex);
        this.txt_gold.string = `${Global.userInfo.gold}`;
        StorageUtils.setStorageJson(StorageName.userInfo, Global.userInfo);

    }

    // update (dt) {}
}
