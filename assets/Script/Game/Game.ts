import { Button } from "../Button";
import { AniPath, ConfigPath, EClickAdsPos, Sound, StorageName, UIPath } from "../GameData";
import { Global } from "../Global";
import SdkApi from "../SDK/SdkApi";
import { AudioManager } from "../util/AudioUtils";
import EventUtil from "../util/EventUtils";
import GameEventType from "../util/GameEventType";
import LoadFactory, { OpenPrefabAni } from "../util/LoadFactory";
import { StorageUtils } from "../util/StorageUtils";
import Bottle from "./Bottle";
import Success from "./Success";

const { ccclass, property } = cc._decorator;

let awardConfig: { [key: string]: any } = {
    "4": {
        awards: [1, 2, 3],
        nextRewardLevel: 1000,
    }
}

type TOper = {
    beginIndex: number,
    endIndex: number,
    moveCount: number,
}

enum ELevelType {
    Normal = "",
    Hide = "h",
    Special = 's',
}

let childArr: { [key: string]: { begin: number, distance?: number, height: number } } = {
    '1': {
        begin: -5,
        distance: 0,
        height: 130,
    },
    '4': {
        begin: -15,
        distance: 96,
        height: 400
    },
    "6": {
        begin: -15,
        distance: 95,
        height: 590,
    },
    "8": {
        begin: -15,
        distance: 95,
        height: 780,
    }
}

enum EBallCount {
    One = 1,
    Four = 4,
    Six = 6,
    Eight = 8,
}

@ccclass
export default class Game extends cc.Component {

    @property(cc.Node)
    node_ani: cc.Node = null;

    @property(Button)
    btn_refresh: Button = null;

    @property(Button)
    btn_add: Button = null;

    @property(Button)
    btn_retract: Button = null;

    @property(Button)
    btn_return: Button = null;

    @property(cc.Node)
    node_cover: cc.Node = null;

    @property(cc.Prefab)
    prefab_bottle: cc.Prefab = null;

    @property(cc.Prefab)
    prefab_ball: cc.Prefab = null;

    @property(cc.Node)
    layout_bottle: cc.Node = null;

    @property(cc.Sprite)
    sp_bg: cc.Sprite = null;

    @property(cc.Sprite)
    sp_back: cc.Sprite = null;

    @property(cc.Sprite)
    sp_add: cc.Sprite = null;

    @property(cc.SpriteFrame)
    sp_ad: cc.SpriteFrame = null;

    @property(cc.Label)
    txt_back: cc.Label = null;

    @property(cc.Label)
    txt_add: cc.Label = null;

    private _addNumber = 0;     // 最多加两个罐子  然后就不给了
    private _isWait = false;    // 移动的时候 不允许点击
    //private _bottleScale = 1;   // 罐子大小  后面会缩小
    private _ballCount = 0; // 多少球
    private _beginIndex = -1;   // 第一次点击按钮

    private _operHistory: TOper[] = [];

    private _delayTime = 0.1;

    private _isSpecial = false;

    private _curOper: TOper = null;

    protected onLoad(): void {
        if(Global.isOpenAds)
        SdkApi.showBanner();
    }

    protected onEnable(): void {
        EventUtil.on(GameEventType.SHOW_ADS, this.showAdsCall, this);
    }

    protected onDisable(): void {
        EventUtil.off(GameEventType.SHOW_ADS, this.showAdsCall, this);
    }

    showAdsCall() {
        if(Global.adsType == EClickAdsPos.gameRefresh) {
            cc.director.loadScene("Game");
        } else if(Global.adsType == EClickAdsPos.returnLogin) {
            cc.director.loadScene("Login");
            SdkApi.hideBanner();
        } else if(Global.adsType == EClickAdsPos.gameAddBottle) {
            this.addBottle();
        } else if(Global.adsType == EClickAdsPos.gameRetract) {
            this.rollBack(this._curOper);
        }
        StorageUtils.setStorageJson(StorageName.userInfo, Global.userInfo);
    }

    async start() {

        Global.game_node = this.node;
        this.refresh();
        if(Global.chooseBgm == "Login" || Global.chooseBgm == "Special") {
            AudioManager.playBGM(Sound.gameBgm);
            Global.chooseBgm = "Game";
        } 
        
        this.sp_bg.spriteFrame = await LoadFactory.loadSprite(`skin/bg/${Global.userInfo.bgSkin}`)

        this.btn_refresh.onTouchEnd(() => {
            if(Global.isOpenAds && Math.random()*10 > 3.5) {
                Global.adsType = EClickAdsPos.gameRefresh;
                SdkApi.showInterstitial();
                return;
            }
            cc.director.loadScene("Game");
        });

        this.btn_return.onTouchEnd(() => {
            if(Global.isOpenAds && Math.random()*10 > 3.5) {
                Global.adsType = EClickAdsPos.returnLogin;
                SdkApi.showInterstitial();
                return;
            }
            cc.director.loadScene("Login");
        });

        this.btn_retract.onTouchEnd(() => {
            if (this._isWait) return;

            if (this._beginIndex != -1) return;

            if (this._operHistory.length) {
                const oper = this._operHistory.pop();

                this._curOper = oper;
                if(Global.isOpenAds) {
                    if(Global.userInfo.backNum) {
                        Global.userInfo.backNum--;
                        this.refresh();
                        this.rollBack(oper);
                    } else {
                        Global.adsType = EClickAdsPos.gameRetract;
                        SdkApi.showReward();
                    }
                } else {
                    this.rollBack(oper);
                }
                if (this._operHistory.length == 0) {
                    this.btn_retract.disable = true;
                }
            } else {
                this.btn_retract.disable = true;
            }
        });

        this.layout_bottle.x = 1000;
        cc.tween(this.layout_bottle)
            .to(0.2, { position: cc.v3(0, 0) }, { easing: "smooth" })
            .start();

        this.btn_add.onTouchEnd(() => {
            if (this._isWait) return;
            if (this._addNumber == 2) {
                console.log("不能加了");
                return;
            }

            if(Global.isOpenAds) {

                if(Global.userInfo.addBottleNum) {
                    Global.userInfo.addBottleNum--;
                    this.refresh();
                    this.addBottle();
                    return;
                } 
                Global.adsType = EClickAdsPos.gameAddBottle;
                SdkApi.showReward();
                
            } else {
                this.addBottle();
            }

          
        });
        this.btn_retract.disable = true;
        this.initUI();
    }

    async loadConfig() {
        const levelConfig = await LoadFactory.loadText(ConfigPath.LevelPath);
        const levelArr = levelConfig.replace(/\r\n/g, '\n').split('\n');
     //   console.log(levelArr);
        Global.levelData = levelArr;
    }

    async initUI() {
        await this.loadConfig();
        const levelConfig = Global.levelData[Global.chooseLevel - 1].split('#');

        const bottleArr = levelConfig[1].split('^');
        console.log(bottleArr.length);

        // 四球
        this._ballCount = bottleArr[0].split(',').length;
        let isHide = false;
        if (levelConfig.length == 3) {
            if (levelConfig[2] === ELevelType.Hide) {
                isHide = true;
            } else if(levelConfig[2] == ELevelType.Special) {
                this._isSpecial = true;
            }
        }

        if(this._isSpecial) {
            AudioManager.playEffect(Sound.special);
            Global.chooseBgm = "Special";
            this.node_ani.active = true;
            this.sp_bg.spriteFrame = await LoadFactory.loadSprite(`skin/bg/special`)

            this.scheduleOnce(()=>{
                let item2 = this.node_ani.getChildByName("item2");
                let item3 = this.node_ani.getChildByName("item3");
        
                item2.y = this.node.height/2*-1;
                item3.y = this.node.height/2-100;
            });
        }


        if(this._isSpecial && Global.userInfo.level == Global.chooseLevel) {
            LoadFactory.loadPrefabPanel({path:UIPath.SkipLayer, ani: OpenPrefabAni.Scale});
        }

        if(this._ballCount < 4) {
            this._ballCount = 4;
        }

        let posArrAndScale = this.getPositionAndScale(bottleArr.length,this._ballCount);
        if (posArrAndScale.vecArr.length == 0) {
            console.log("没设置位置  赶紧去设置");
        }

        for (let i = 0; i < bottleArr.length; i++) {
            let ballArr = bottleArr[i].split(',');
            if (bottleArr[i] == "") {
                ballArr = [];
            }
            let bottleNode = cc.instantiate(this.prefab_bottle);
            this.layout_bottle.addChild(bottleNode);
            bottleNode.setPosition(posArrAndScale.vecArr[i]);      // 调整位置
            bottleNode.scale = posArrAndScale.scale;   // 设置大小
            //bottleNode.height = childArr[this._ballCount].height;

            let bottleCom = bottleNode.getComponent(Bottle);

            bottleCom.init({
                capacity: this._ballCount,
                isHide,  // 后面是隐藏关
                ballChild: ballArr,
                prefabBall: this.prefab_ball,
                begin: childArr[this._ballCount].begin,
                distance: childArr[this._ballCount].distance,
                height: childArr[this._ballCount].height,
            })

            bottleNode.getComponent(Button).onTouchEnd(() => {
                this.addClickEvent(i);
            });
        }
    }

    addBottle() {
        let posArrAndScale = this.getPositionAndScale(this.layout_bottle.childrenCount + 1,this._ballCount);
        const bottleNode = cc.instantiate(this.prefab_bottle);
        this.layout_bottle.addChild(bottleNode);
        bottleNode.scale = posArrAndScale.scale;

        if (posArrAndScale.vecArr.length == 0) {
            console.log("没设置位置  赶紧去设置");
        }

        this.layout_bottle.children.forEach((val, index) => {
            cc.tween(val)
                .parallel(
                    cc.tween().to(0.2, { position: posArrAndScale.vecArr[index] }),
                    cc.tween().to(0.2, { scale: posArrAndScale.scale })
                )
                .start();
        })

        let newNodePos = posArrAndScale.vecArr[posArrAndScale.vecArr.length - 1];
        bottleNode.setPosition(cc.v3(newNodePos.x + 1000, newNodePos.y));
        cc.tween(bottleNode)
            .to(0.2, { position: newNodePos })
            .start();

        let bottleCom = bottleNode.getComponent(Bottle);

        bottleCom.init({
            capacity: 1,
            isHide: false,  // 后面是隐藏关
            ballChild: [],
            prefabBall: this.prefab_ball,
            begin: childArr[1].begin,
            distance: childArr[1].distance,
            height: childArr[1].height,
        })

        bottleNode.getComponent(Button).onTouchEnd(() => {
            this.addClickEvent(posArrAndScale.vecArr.length - 1);
        });
        this._addNumber++;
        this.btn_add.disable = this._addNumber == 2;

        //this.btn_add.disable = true;
    }

    addClickEvent(index: number) {
        if (this._isWait) { return; }
        if (this._beginIndex != -1) {
            if (this._beginIndex == index) {
                this.moveDown(index);
                this._beginIndex = -1;
            } else {
                // 开始移动
                this.move(this._beginIndex, index);
            }
        } else {
            this._beginIndex = index;
            this.moveUp(index);
        }
    }

    // 上来
    moveUp(index: number) {
        const com = this.layout_bottle.children[index].getComponent(Bottle);
        const height = com.height();
        const count = com.childCount();
        if (count == 0) {
            this._beginIndex = -1;
            return;
        }

        // 满状态返回
        if (com.isFull()) {
            this._beginIndex = -1;
            return;
        }

        this._isWait = true;
        cc.tween(com.ballNode().children[count - 1])
            .to(this._delayTime, { position: cc.v3(0, height) })
            .call(() => {
                this._isWait = false;
            })
            .start();
    }


    // 下去
    moveDown(index: number) {
        const com = this.layout_bottle.children[index].getComponent(Bottle);
        const begin = com.begin();
        const distance = com.distance();
        const count = com.childCount();
        this._isWait = true;
        cc.tween(com.ballNode().children[count - 1])
            .to(this._delayTime, { position: cc.v3(0, begin + (count - 1) * distance - 10) })
            .to(this._delayTime / 2, { position: cc.v3(0, begin + (count - 1) * distance) })
            .call(() => {
                this._isWait = false;
            })
            .start();
    }

    move(beginIndex: number, endIndex: number) {
        const beginCom = this.layout_bottle.children[beginIndex].getComponent(Bottle);
        const endCom = this.layout_bottle.children[endIndex].getComponent(Bottle);
        const beginHeight = beginCom.height();
        const beginCount = beginCom.childCount();
        const endCapacity = endCom.capacity();
        const endCount = endCom.childCount();
        const endHeight = endCom.height();
        const endBegin = endCom.begin();
        const endDistance = endCom.distance();


        // 结束的罐子满了
        if (endCom.capacity() == endCom.childCount()) {
            this.moveDown(beginIndex);
            this._beginIndex = -1;
            return;
        }

        const beginColor = beginCom.topNodeName();
        const endColor = endCom.topNodeName();


        // 开始转移
        if (beginColor == endColor || endColor == "") {
            let moveIndex = -1; // 4个球移除到MoveIndex 为止
            for (let i = beginCom.ballNode().childrenCount - 1; i >= 0; i--) {
                if (beginCom.ballNode().children[i].name != beginColor) {
                    moveIndex = i;
                    break;
                }
            }

            moveIndex++;

            // 移动一个
            if (moveIndex == beginCount - 1) {
                let moveNode = beginCom.ballNode().children[moveIndex];
                let movePos = beginCom.ballNode().children[moveIndex].convertToWorldSpaceAR(cc.Vec2.ZERO);
                movePos = endCom.ballNode().convertToNodeSpaceAR(movePos);
                this.scheduleOnce(()=>{
                    endCount !=0 && endCom.playAni(endCount);
                },0.2);
                
                moveNode.setParent(endCom.ballNode());
                moveNode.setPosition(movePos);
                this._isWait = true;
                cc.tween(moveNode)
                    .to(this._delayTime, { position: cc.v3(0, endHeight) })
                    .to(this._delayTime, { position: cc.v3(0, endBegin + endCount * endDistance - 10) })
                    .to(this._delayTime / 2, { position: cc.v3(0, endBegin + endCount * endDistance) })
                    .call(() => {
                        this._isWait = false;
                        beginCom.showDoubt();
                        let successCount = endCom.check();
                        this.passCheck(successCount);
                    })
                    .start();
            } else {    // 移动多个

                // 容量不够  能放几个放几个
                if ((endCapacity - endCount) <= (beginCount - 1 - moveIndex)) {
                    let remainCapacity = endCapacity - endCount;
                    moveIndex = beginCount - remainCapacity;
                }

                let topNode = beginCom.ballNode().children[beginCount - 1];
                let movePos = beginCom.ballNode().children[beginCount - 1].convertToWorldSpaceAR(cc.Vec2.ZERO);
                
                //endCount !=0 && endCom.playAni(endCount);
                this.scheduleOnce(()=>{
                    endCount !=0 && endCom.playAni(endCount);
                },0.2);
                
                movePos = endCom.ballNode().convertToNodeSpaceAR(movePos);
                topNode.setParent(endCom.ballNode());
                topNode.setPosition(movePos);

                // 移动最上方一个
                cc.tween(topNode)
                    .to(this._delayTime, { position: cc.v3(0, endHeight) })
                    .to(this._delayTime, { position: cc.v3(0, endBegin + endCount * endDistance - 10) })
                    .to(this._delayTime / 2, { position: cc.v3(0, endBegin + endCount * endDistance) })
                    .call(() => {
                        if(moveIndex == beginCount - 1) {
                            let passOne = endCom.check();
                            this.passCheck(passOne);
                            console.log("我调用了");
                        }                        
                    })
                    .start();
                let delayCount = 1;

                
                // 连同下方一起移动
                for (let i = beginCount - 2; i >= moveIndex; i--, delayCount++) {
                    let bottomNode = new cc.Node();
                    bottomNode = beginCom.ballNode().children[i];
                    this._isWait = true;
                    cc.tween(bottomNode)
                        .delay(delayCount * this._delayTime)
                        .to(this._delayTime, { position: cc.v3(0, beginHeight) })    //上移
                        .call(() => {
                            let bottomPos = beginCom.ballNode().children[i].convertToWorldSpaceAR(cc.Vec2.ZERO);
                            bottomPos = endCom.ballNode().convertToNodeSpaceAR(bottomPos);
                            bottomNode.setParent(endCom.ballNode())
                            bottomNode.setPosition(bottomPos);
                        })
                        .to(this._delayTime, { position: cc.v3(0, endHeight) })    // 左右移动
                        .to(this._delayTime, { position: cc.v3(0, endBegin + (endCount + delayCount) * endDistance - 10) })
                        .to(this._delayTime / 2, { position: cc.v3(0, endBegin + (endCount + delayCount) * endDistance) })    // 下移
                        .call(() => {
                            if (i == moveIndex) {
                                console.log("gg");
                                this._isWait = false;
                                beginCom.showDoubt();
                                let passOne = endCom.check();
                                this.passCheck(passOne);
                            }
                        })
                        .start();
                }
            }

            this._operHistory.push({
                beginIndex,
                endIndex,
                moveCount: beginCount - moveIndex,
            })
            this.btn_retract.disable = false;
            this._beginIndex = -1;
        } else {
            this.moveDown(beginIndex);
            this._beginIndex = -1;
            return;
        }
    }

    async passCheck(passOne: boolean) {
        let pass = this.layout_bottle.children.every((val) => {
            let com = val.getComponent(Bottle);
            if (com.isFull() || com.childCount() == 0) return true;
            else return false;
        })
        if (pass) {

            if(Global.isOpenAds)
            SdkApi.hideBanner();
            if(this._isSpecial) {
                LoadFactory.loadPrefabPanel({path:UIPath.SpecialLevel, ani:OpenPrefabAni.Scale});
            } else {
                let node = await LoadFactory.loadPrefabPanel({ path: UIPath.Success, ani:OpenPrefabAni.Scale});

                console.log("-------", Global.chooseLevel, Global.userInfo.level);

                node.getComponent(Success).setPass(Global.chooseLevel == Global.userInfo.level);
            }
            AudioManager.playEffect(Sound.passAll);
        } else if(passOne) {
            AudioManager.playEffect(Sound.passOne);
            // let flowerNode = await LoadFactory.loadPrefabPanel({path:UIPath.Flower});
            // console.log("撒花撒花");
            // this.scheduleOnce(()=>{
            //     flowerNode.destroy();
            // },1.2);
        }
    }


    // 罐子位置（根据数量不同 位置不同）
    getPositionAndScale(bottleCount: number, ballCount: number): { vecArr: cc.Vec3[], scale: number } {
        let table: { vecArr: cc.Vec3[], scale: number } = { vecArr: [], scale: 0 };

        switch (bottleCount) {
            case 2: table.vecArr = [cc.v3(-100, -250), cc.v3(100, -250)]; table.scale = 1; break;
            case 3: table.vecArr = [cc.v3(-200, -250), cc.v3(0,-250), cc.v3(200, -250)]; table.scale = 1; break;
            case 4: table.vecArr = [cc.v3(-100, 0), cc.v3(100, 0), cc.v3(-100, -500), cc.v3(100, -500)]; table.scale = 1; break;
            case 5: table.vecArr = [cc.v3(-200, 0), cc.v3(0, 0), cc.v3(200, 0), cc.v3(-100, -500), cc.v3(100, -500)]; table.scale = 1; break;
            case 6: table.vecArr = [cc.v3(-200, 0), cc.v3(0, 0), cc.v3(200, 0), cc.v3(-200, -500), cc.v3(0, -500), cc.v3(200, -500)]; table.scale = 1; break;
            case 7: table.vecArr = [cc.v3(-258, 0), cc.v3(-86, 0), cc.v3(86, 0), cc.v3(258, 0), cc.v3(-200, -500), cc.v3(0, -500), cc.v3(200, -500)]; table.scale = 1; break;
            case 8: table.vecArr = [cc.v3(-258, 0), cc.v3(-86, 0), cc.v3(86, 0), cc.v3(258, 0), cc.v3(-258, -500), cc.v3(-86, -500), cc.v3(86, -500), cc.v3(258, -500),]; table.scale = 1; break;
            case 9: table.vecArr = [cc.v3(-284, 0), cc.v3(-142, 0), cc.v3(0, 0), cc.v3(142, 0), cc.v3(284, 0), cc.v3(-258, -500), cc.v3(-86, -500), cc.v3(86, -500), cc.v3(258, -500),]; table.scale = 1; break;
            case 10: table.vecArr = [cc.v3(-284, 0), cc.v3(-142, 0), cc.v3(0, 0), cc.v3(142, 0), cc.v3(284, 0), cc.v3(-284, -500), cc.v3(-142, -500), cc.v3(0,-500), cc.v3(142, -500), cc.v3(284, -500),]; table.scale = 1; break;
            case 11: table.vecArr = [cc.v3(-305, 0), cc.v3(-183, 0), cc.v3(-61,0), cc.v3(61, 0), cc.v3(183, 0), cc.v3(305, 0), cc.v3(-284, -500), cc.v3(-142, -500), cc.v3(0,-500), cc.v3(142, -500), cc.v3(284, -500),]; table.scale = 0.8; break;
            case 12: table.vecArr = [cc.v3(-305, 0), cc.v3(-183, 0), cc.v3(-61,0), cc.v3(61, 0), cc.v3(183, 0), cc.v3(305, 0), cc.v3(-305, -500), cc.v3(-183, -500), cc.v3(-61,-500), cc.v3(61,-500), cc.v3(183, -500), cc.v3(305, -500)]; table.scale = 0.8; break;
            case 13: table.vecArr = [cc.v3(-306, 0), cc.v3(-204, 0), cc.v3(-102,0), cc.v3(0,0), cc.v3(102, 0), cc.v3(204, 0), cc.v3(306, 0), cc.v3(-305, -500), cc.v3(-183, -500), cc.v3(-61,-500), cc.v3(61,-500), cc.v3(183, -500), cc.v3(305, -500)]; table.scale = 0.7; break;
            case 14: table.vecArr = [cc.v3(-306, 0), cc.v3(-204, 0), cc.v3(-102,0), cc.v3(0,0), cc.v3(102, 0), cc.v3(204, 0), cc.v3(306, 0), cc.v3(-306, -500), cc.v3(-204, -500), cc.v3(-102,-500), cc.v3(0,-500), cc.v3(102,-500), cc.v3(204, -500), cc.v3(306, -500)]; table.scale = 0.7; break;
            case 15: table.vecArr = [cc.v3(-322, 0), cc.v3(-230, 0), cc.v3(-138,0), cc.v3(-46,0), cc.v3(46,0), cc.v3(138, 0), cc.v3(230, 0), cc.v3(322, 0), cc.v3(-306, -500), cc.v3(-204, -500), cc.v3(-102,-500), cc.v3(0,-500), cc.v3(102,-500), cc.v3(204, -500), cc.v3(306, -500)]; table.scale = 0.6; break;
            case 16: table.vecArr = [cc.v3(-322, 0), cc.v3(-230, 0), cc.v3(-138,0), cc.v3(-46,0), cc.v3(46,0), cc.v3(138, 0), cc.v3(230, 0), cc.v3(322, 0), cc.v3(-322, -500), cc.v3(-230, -500), cc.v3(-138,-500), cc.v3(-46,-500), cc.v3(46,-500), cc.v3(138,-500), cc.v3(230, -500), cc.v3(322, -500)]; table.scale = 0.6; break;           
        }

        if(ballCount == EBallCount.Six) {
            table.scale *= 0.7;
        } else if(ballCount == EBallCount.Eight) {
            table.scale *= 0.55;
        }

        return table;
    }

    rollBack(oper: TOper) {
        let { beginIndex, endIndex, moveCount } = oper;
        let beginCom = this.layout_bottle.children[beginIndex].getComponent(Bottle);
        let endCom = this.layout_bottle.children[endIndex].getComponent(Bottle);

        const beginCount = beginCom.childCount();
        const beginBegin = beginCom.begin();
        const beginDistance = beginCom.distance();
        const beginHeight = beginCom.height();
        const endCount = endCom.childCount();
        const endBegin = endCom.begin();
        const endDistance = endCom.distance();
        const endHeight = endCom.height();

        this._isWait = true;
        for (let i = 0; i < moveCount; i++) {
            let node = new cc.Node();
            node = endCom.ballNode().children[endCount - 1 - i];

            cc.tween(node)
                .delay(this._delayTime * i)
                .to(this._delayTime, { position: cc.v3(0, endHeight) })
                .call(() => {
                    let nodePos = node.convertToWorldSpaceAR(cc.Vec2.ZERO);
                    nodePos = beginCom.ballNode().convertToNodeSpaceAR(nodePos);
                    node.setParent(beginCom.ballNode())
                    node.setPosition(nodePos);
                })
                .to(this._delayTime, { position: cc.v3(0, beginHeight) })
                .to(this._delayTime, { position: cc.v3(0, beginBegin + (beginCount + i) * beginDistance - 10) })
                .to(this._delayTime / 2, { position: cc.v3(0, beginBegin + (beginCount + i) * beginDistance) })
                .call(() => {
                    if (i == moveCount - 1) {
                        this._isWait = false;
                    }
                })
                .start();
        }
    }

    refresh() {
        if(Global.userInfo.addBottleNum) {
            this.txt_add.string = `${Global.userInfo.addBottleNum}`;
        } else {
            this.sp_add.spriteFrame = this.sp_ad;
            this.txt_add.node.active = false;
        }

        if(Global.userInfo.backNum) {
            this.txt_back.string = `${Global.userInfo.backNum}`;
        } else {
            this.sp_back.spriteFrame = this.sp_ad;
            this.txt_back.node.active = false;
        }
    }

    // update (dt) {}
}
