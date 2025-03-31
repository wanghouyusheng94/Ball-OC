
import { Button } from "../Button";
import { AniPath, Sound, StorageName } from "../GameData";
import { Global } from "../Global";
import { AudioManager } from "../util/AudioUtils";
import Common from "../util/Common";
import LoadFactory from "../util/LoadFactory";
import { StorageUtils } from "../util/StorageUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Success extends cc.Component {

    @property(cc.Node)
    node_light: cc.Node = null;

    @property(Button)
    btn_use: Button = null;

    @property(cc.Node)
    node_goldFrame: cc.Node = null;

    @property(cc.Node)
    node_chest: cc.Node = null;

    @property(cc.Node)
    node_award: cc.Node = null;

    @property(cc.Sprite)
    sp_award: cc.Sprite = null;

    @property(cc.Node)
    node_amazing: cc.Node = null;

    @property(Button)
    btn_next: Button = null;

    @property(cc.Node)
    node_spr: cc.Node = null;

    @property(cc.Prefab)
    prefab_gold: cc.Prefab = null;

    @property(cc.Label)
    txt_gold: cc.Label = null;

    @property(cc.Node)
    node_bg: cc.Node = null;

    @property(cc.Node)
    node_gold: cc.Node = null;

    private _isNew = false;


    setPass(isNew: boolean) {
        this._isNew = isNew;

        this.scheduleOnce(async ()=>{

            const left = await LoadFactory.loadNode(AniPath.Left);
            const right = await LoadFactory.loadNode(AniPath.Right);
            this.node.addChild(left);
            this.node.addChild(right);
            left.getComponent(cc.Animation).play('left');           
            right.getComponent(cc.Animation).play('right');
            this.scheduleOnce(()=>{
                if(this?.node?.isValid) {
                    left.active = false;
                    right.active = false;
                }
            },1.8);


        },0.5);
        this.startShow();

    }

    protected async  startShow() {

        this.txt_gold.string = Global.userInfo.gold.toString();

        console.log("-------Start", this._isNew);

        if(this._isNew) {
            let time = 0.2;

            console.log("-------isNew", this._isNew);

            cc.tween(this.node_amazing)
            .to(time, {scale: 1.1})
            .to(time, {scale: 1})
            .to(time, {scale: 0.9})
            .to(time, {scale: 1})
            .union()
            .repeatForever()
            .start();
    
            console.log("-------循环播放amazing");

            let json: { [key: string]: { award: string[] }} = {};
            let key = "0";

            for(let i in Global.awardConfig) {
                if(parseInt(i) >= Global.userInfo.level) {
                    json[i] = Global.awardConfig[i];
                    key = i;
                    break;
                }
            }

            console.log("-------获取到key", key);

            if(key == "0") {
                this.hideAward();
                return;
            }

            let maxProgress = parseInt(key);
            let curProgress = Global.userInfo.level;
            Global.userInfo.level++;
            let awardStr = (Global.awardConfig[key].award[0] as string).split('_');

            console.log("-------奖励数据", awardStr);

            let awardSkin = awardStr[0];
            let awardIndex = awardStr[1];

            console.log("-------具体奖励", awardSkin, awardIndex);

            let skinPath = '';
            if(awardSkin == 'ball') {
                skinPath = `ball/${awardIndex}/1`;
            } else {
                skinPath = `${awardSkin}/mini${awardIndex}`;
            }

            this.sp_award.spriteFrame = await LoadFactory.loadSprite(`skin/${skinPath}`);
            this.node_spr.width = ((curProgress-1)/maxProgress*336);

            console.log("-------width", curProgress/maxProgress*336);

            this.btn_next.node.active = false;
            cc.tween(this.node_spr)
            .to(0.5,{width: curProgress/maxProgress*336})
            .call(()=>{
                console.log("-------移动完成", curProgress/maxProgress*336);



                if(maxProgress == curProgress) {

                    console.log("-------获取物品");

                    if(awardSkin == "ball") {
                        Global.userInfo.unlockBall.push(`${awardIndex}`);
                        Global.userInfo.ballSkin = `${awardIndex}`;
                    } else if(awardSkin == "bottle") {
                        Global.userInfo.unlockBottle.push(`${awardIndex}`);
                        Global.userInfo.bottleSkin = `${awardIndex}`;
                    } else if(awardSkin == "bg") {
                        Global.userInfo.unlockBg.push(`${awardIndex}`);
                        Global.userInfo.bgSkin = `${awardIndex}`;
                    }

                    console.log("-------物品", awardSkin);

                    Global.userInfo.gold += 4;                  
                    let duration = 0.5;
                    cc.tween(this.sp_award.node)
                    .parallel(
                        cc.tween().to(duration,{position: cc.v2(0,0)}),
                        cc.tween().to(duration, {scale:2})
                    )
                    .call(()=>{
                        console.log("-------light显示");
                        this.node_light.active = true;
                        this.btn_use.node.active = false;
                        this.node_light.opacity = 0;
                        cc.tween(this.node_light)
                        .to(0.5,{opacity:255})
                        .call(()=>{
                            console.log("-------use显示");
                            this.btn_use.node.active = true;
                            this.btn_use.node.opacity = 0;
                            cc.tween(this.btn_use.node)
                            .to(0.5, {opacity:255})
                            .start();
                        })
                        .start();

                        this.schedule(()=>{
                            this.node_light.angle += 4;
                        },0.02);
                    })
                    .start();    
                } else {

                    console.log("-------获取金币");

                    let curGold = Global.userInfo.gold;  
                    Global.userInfo.gold += 4;                  
                    this.node_chest.getComponent(sp.Skeleton).animation = "fire1";

                    console.log("-------开箱");

                    this.scheduleOnce(()=>{
                        for(let i = 1; i <= 4;i++) {
                            this.scheduleOnce(()=>{
                                let node = cc.instantiate(this.prefab_gold);
                                this.node_bg.addChild(node);
                                
                                node.x = 50 - Math.random()*100;
                                node.y = 50 - Math.random()*100;
                                   
                                let action = Common.getBezierAnim(node, this.node_gold,Math.random(), this.node);
                                console.log("-------金币移动动画");
                                node.runAction(cc.sequence(action,cc.callFunc(()=>{
                                    cc.tween(this.node_gold)
                                    .to(0.05,{scale:1.1})
                                    .to(0.05,{scale:1})
                                    .call(()=>{
                                        AudioManager.playEffect(Sound.getGold);
                                        this.txt_gold.string = `${curGold + i}`;    
                                        if(i == 4) {
                                            this.playNextBtnAni();
                                        }    
                                    })
                                    .start();
                                    node.destroy();
                                })));
                            },i * 0.1);                            
                        }

                    }, 2);
                }                
            })
            .start();

           
           

        } else {
            this.node_award.active = false;
            this.node_chest.active = false;
            this.playNextBtnAni();
        }

        this.btn_next.onTouchEnd(()=>{
            Global.chooseLevel++;
            if(Global.userInfo.level > Global.chooseLevel && Global.chooseLevel % 6 == 0) {
                Global.chooseLevel++;
            }            
            cc.director.loadScene("Game");
        });

        this.btn_use.onTouchEnd(()=>{
            this.node_light.active = false;
            this.btn_use.node.active = false;
            this.sp_award.node.active = false;
            this.btn_next.node.active = true;
        });

    }

    protected onDestroy(): void {
        StorageUtils.setStorageJson(StorageName.userInfo, Global.userInfo);
    }

    playNextBtnAni() {

        console.log("-------next展示");

        this.btn_next.node.active = true;
        this.btn_next.node.opacity = 0;
        cc.tween(this.btn_next.node)
        .to(0.5, {opacity:255})
        .start();
    }

    hideAward() {
        this.node_award.active = false;
        this.btn_next.node.active = true;
        Global.userInfo.level++;
    }

    // update (dt) {}
}
