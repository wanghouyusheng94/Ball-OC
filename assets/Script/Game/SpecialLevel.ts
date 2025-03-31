// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Button } from "../Button";
import { EClickAdsPos, Sound, StorageName } from "../GameData";
import { Global } from "../Global";
import SdkApi from "../SDK/SdkApi";
import { AudioManager } from "../util/AudioUtils";
import Common from "../util/Common";
import EventUtil from "../util/EventUtils";
import GameEventType from "../util/GameEventType";
import { StorageUtils } from "../util/StorageUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SpecialLevel extends cc.Component {

    @property(cc.Node)
    sp_turnplate: cc.Node = null;

    @property(cc.Node)
    node_arrow: cc.Node = null;

    @property(cc.Node)
    node_gold: cc.Node = null;

    @property(cc.Label)
    txt_gold: cc.Label = null;

    @property(cc.Node)
    node_empty: cc.Node = null;

    @property(cc.Prefab)
    prerfab_gold: cc.Prefab = null;

    @property(Button)
    btn_extra: Button = null;

    @property(Button)
    btn_confirm: Button = null;

    @property(cc.Label)
    txt_special: cc.Label = null;

    @property(cc.Prefab)
    prefab_gold: cc.Prefab = null;

    @property(cc.Node)
    node_bg: cc.Node = null;

    @property(cc.Node)
    node_beginMoveGold: cc.Node = null;

    // 添加金币
    private _maxGold = 0;

    // 旋转停止下标
    private _stopIndex = 0;

    private _clickState = false;

    protected onEnable(): void {
        EventUtil.on(GameEventType.SHOW_ADS, this.showAdsCall, this);
    }

    protected onDisable(): void {
        EventUtil.off(GameEventType.SHOW_ADS, this.showAdsCall, this);
    }

    showAdsCall() {
        if(Global.adsType == EClickAdsPos.specialAddGold) {
            this.playAni();
        }
    }

    start () {

        Global.userInfo.level++;
        Global.chooseLevel++;

        this.scheduleOnce(()=>{
            cc.tween(this.btn_confirm.node)
            .to(1,{opacity:255})
            .start();
        },2);

        this.btn_extra.onTouchEnd(()=>{
            if(this._clickState) return;
            this._clickState = true;

            if(Global.isOpenAds) {
                Global.adsType = EClickAdsPos.specialAddGold;
                SdkApi.showReward();
            } else {
                this.playAni();
            }
        })
        this.txt_gold.string = Global.userInfo.gold.toString();
     
        this.btn_confirm.onTouchEnd(()=>{
            if(this._clickState) return;
            this._clickState = true;
            Global.userInfo.gold += 20;
            cc.director.loadScene("Game");
        });

    }

    playAni() {
        this._stopIndex = Math.floor(Math.random() * 5);
        let angle = 0;
        const endAngle = 90 - 36*this._stopIndex - 36*Math.random();

        if(angle > 0) {
            cc.tween(this.node_arrow)
            .to(0.4, { angle: -90 }, { easing: 'sineInOut' })  // 先慢，使用缓动函数使其慢速平滑过渡到 -90 度
            .repeat(
                3,  // 移动 3 圈
                cc.tween()
                    .to(0.2, { angle: 90 }, { easing: 'sineInOut' }) // 中间快，使用缓动函数使其快速平滑过渡到 90 度
                    .to(0.2, { angle: -90 }, { easing: 'sineInOut' }) // 中间快，再回到 -90 度
            )
            .to(1, { angle: endAngle }, { easing: 'sineInOut' }) // 最后慢，使用缓动函数使其慢速平滑过渡到 endAngle
            .call(()=>{
                this.addGold();
            })
            .start();
    
        } else {
            cc.tween(this.node_arrow)
            .to(0.4, { angle: -90 }, { easing: 'sineInOut' })  // 先慢，使用缓动函数使其慢速平滑过渡到 -90 度
            .repeat(
                3,  // 移动 3 圈
                cc.tween()
                    .to(0.2, { angle: 90 }, { easing: 'sineInOut' }) // 中间快，使用缓动函数使其快速平滑过渡到 90 度
                    .to(0.2, { angle: -90 }, { easing: 'sineInOut' }) // 中间快，再回到 -90 度
            )
            .to(0.2,{angle: 90})
            .to(1, { angle: endAngle }, { easing: 'sineInOut' }) // 最后慢，使用缓动函数使其慢速平滑过渡到 endAngle
            .call(()=>{
                this.addGold();
            })
            .start();
        }
    }

    addGold() {

        let addGold = 20;
        switch(this._stopIndex) {
            case 0:
            case 4:
                addGold *= 0.2; break;
            case 1: 
            case 3:
                addGold *= 0.5; break;
            case 2: 
            addGold *= 1; break;
        }

        this.sp_turnplate.getChildByName(`choose${this._stopIndex + 1}`).active = true;

        this._maxGold = 20 + addGold;
        for(let i = 1;i <= 10;i++) {
            this.scheduleOnce(()=>{
                this.txt_special.string = `${20+addGold/10*i}`;
                if(i == 10) {
                    this.playGoldAni();
                }  
            },0.15*i);           
        }
    }

    playGoldAni() {
        let curGold = Global.userInfo.gold;  
        Global.userInfo.gold += this._maxGold;
        for(let i = 1; i <= 4;i++) {
            this.scheduleOnce(()=>{
                let node = cc.instantiate(this.prefab_gold);
                this.node_beginMoveGold.addChild(node);

                node.x = 50 - Math.random()*100;
                node.y = 50 - Math.random()*100;
                   
                let action = Common.getBezierAnim(node, this.node_gold,Math.random(), this.node);

                node.runAction(cc.sequence(action,cc.callFunc(()=>{
                    cc.tween(this.node_gold)
                    .to(0.05,{scale:1.1})
                    .to(0.05,{scale:1})
                    .call(()=>{
                        AudioManager.playEffect(Sound.getGold);
                        this.txt_gold.string = `${curGold + Math.floor(this._maxGold*i/4)}`;    
                        if(i == 4) {
                            StorageUtils.setStorageJson(StorageName.userInfo, Global.userInfo);
                            cc.director.loadScene("Game");
                        }    
                    })
                    .start();
                    node.destroy();
                })));
            },i * 0.1);                            
        }
    }

    // update (dt) {}
}
