// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Button } from "../../Button";
import { Global } from "../../Global";
import LoadFactory from "../../util/LoadFactory";
import ChooseSkinLayer, { ESkinType } from "./ChooseSkinLayer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChooseSkinItem extends cc.Component {

    @property(cc.Node)
    node_show: cc.Node = null;

    @property(cc.Sprite)
    sp_skin: cc.Sprite = null;

    @property(cc.Node)
    node_choose: cc.Node = null;

    @property(cc.Node)
    node_hide: cc.Node = null;

    @property(cc.Label)
    txt_label: cc.Label = null;

    private _curIndex = 0;
    private _skinType = 0;
    private _parent: ChooseSkinLayer = null;

    changeIndex(index: number) {
        if(index < 1) {
            index = 10;
        } 
        return index;
    }

    async refreshShow(skinType: number, index: number, parent: ChooseSkinLayer) {

        this._skinType = skinType;
        this._curIndex = index;
        this._parent = parent;

        let skinName = "";
        let skinPath = "";

        let skinData: string[] = [];

        // 当前关卡解锁皮肤
        let skinLevelArr = [];


        
        if(skinType == 0) {
            skinName = "ball";
            skinPath = `ball/${this.changeIndex(index)}/1`;
            skinData = Global.userInfo.unlockBall;
            skinLevelArr = [4, 22, 82, 154,251];
        } else if(skinType == 1) {
            skinName = "bottle";
            skinPath = `bottle/mini${this.changeIndex(index)}`;
            skinData = Global.userInfo.unlockBottle;
            skinLevelArr = [10, 45, 101,182,285];
        } else {
            skinName = "bg";
            skinPath = `bg/mini${this.changeIndex(index)}`;
            skinData = Global.userInfo.unlockBg;
            skinLevelArr = [16, 59, 125,211,301];
        }
            

        console.log('path',skinPath);

        this.sp_skin.spriteFrame = await LoadFactory.loadSprite(`skin/${skinPath}`);

        // 已经有了
        let show = skinData.some(val=>parseInt(val) == this.changeIndex(index));
        this.node_hide.active = !show;

        if(show) {
            if(Global.userInfo[`${skinName}Skin`] == this.changeIndex(index)) {
                this.node_choose.active = true;
            } else {
                this.node_choose.active = false;
            }
        } else {
            if(index < 6 && index > 0) {
                this.txt_label.string = `LV.${skinLevelArr[index-1]}`
            } else {
                let needGold = 0;
                if(index == 6) needGold = 500;
                else needGold = 1000;
                this.txt_label.string = `$${needGold}`;
            }
        }
    }


    start () {

        this.node_show.getComponent(Button).onTouchEnd(()=>{
            if(this._skinType == 0) {
                if(this.changeIndex(this._curIndex).toString() == Global.userInfo.ballSkin) return;
                else {
                    Global.userInfo.ballSkin = this.changeIndex(this._curIndex).toString();
                    this._parent.refresh();
                }
            } else if(this._skinType == 1) {
                if(this.changeIndex(this._curIndex).toString() == Global.userInfo.bottleSkin) return;
                else {
                    Global.userInfo.bottleSkin = this.changeIndex(this._curIndex).toString();
                    this._parent.refresh();
                }
            } else {
                if(this.changeIndex(this._curIndex).toString() == Global.userInfo.bgSkin) return;
                else {
                    Global.userInfo.bgSkin = this.changeIndex(this._curIndex).toString();
                    this._parent.refresh();
                }
            }
        });

        this.node_hide.getComponent(Button).onTouchEnd(()=>{
            if(this._curIndex < 6 && this._curIndex > 0) {
                LoadFactory.loadTipsPanel("Please unlock the level!");
            } else {
                let needGold = 500;
                if(this._curIndex > 6 || this._curIndex == 0) {
                    needGold = 1000;
                }

                if(Global.userInfo.gold >= needGold) {
                    Global.userInfo.gold -= needGold;

                    let skin = this.changeIndex(this._curIndex).toString();

                    if(this._skinType == 0) {
                        Global.userInfo.unlockBall.push(skin);
                    } else if(this._skinType == 1) {
                        Global.userInfo.unlockBottle.push(skin);
                    } else {
                        Global.userInfo.unlockBg.push(skin);
                    }

                    this._parent.refresh();
                    LoadFactory.loadTipsPanel("Unlocked successfully!");
                } else {
                    if(Global.isOpenAds && Global.userInfo.lookAdsNum > 0) {
                        this._parent.openPanel();
                    } else {
                        LoadFactory.loadTipsPanel(`Please collect ${needGold} gold coins!`);
                    }                    
                }
            }
        });


    }

    // update (dt) {}
}
