
import { AniPath } from "../GameData";
import { Global } from "../Global";
import LoadFactory from "../util/LoadFactory";

/**
 * capacity: 容量
 * length: 总长度
 */
// 罐子里面的数据
export type TBottleData = {
    capacity: number,
    isHide: boolean,
    ballChild?: string[],
    prefabBall: cc.Prefab,
    begin: number,
    distance: number,
    height?: number,
}
/**
 * begin: 往下移动像素
 * distance: 两个球间距
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bottle extends cc.Component {

    @property(cc.Node)
    node_ballParent: cc.Node = null;

    @property(cc.Animation)
    ani: cc.Animation = null;

    // 是否已满
    private _full = false;
    private _bottleData:TBottleData = null;

    private _waitSchedule:Function = null;

    async init(data: TBottleData) {
        let { capacity, isHide, ballChild , prefabBall, begin, distance, height} = data;

        this._bottleData = data;
        this.node.height = height;
        this.node_ballParent.height = height;
        let sprite = await LoadFactory.loadSprite(`skin/bottle/${Global.userInfo.bottleSkin}`);

        if(this?.node?.isValid) {
            this.node.getComponent(cc.Sprite).spriteFrame = sprite;
        }

        console.log("height",height);
        if(ballChild.length == 0) {
            return;
        }
        

        for(let i = 0;i < ballChild.length;i++) {
            let ballNode = cc.instantiate(prefabBall);
            this.node_ballParent.addChild(ballNode);
            ballNode.name = ballChild[i];   // 直接用数字做名字
            ballNode.y = begin + distance * i;

            if(isHide && i!=ballChild.length-1) {
                let spriteFrame = await LoadFactory.loadSprite(`skin/ball/${Global.userInfo.ballSkin}/doubt`);
                ballNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                ballNode.name = 'doubt';
            } else {
                let spriteFrame = await LoadFactory.loadSprite(`skin/ball/${Global.userInfo.ballSkin}/${ballChild[i]}`);
                ballNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }
        }
    }    

    // 显示疑问球
    async showDoubt() {
        if(this.childCount()) {
            let refreshNode = this.node_ballParent.children[this.childCount()-1];
            if(refreshNode.name != "doubt") return;
            refreshNode.name = this._bottleData.ballChild[this.childCount()-1];

            let spriteFrame = await LoadFactory.loadSprite(`skin/ball/${Global.userInfo.ballSkin}/${this._bottleData.ballChild[this.childCount()-1]}`);
            refreshNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;

            cc.tween(refreshNode)
            .set({opacity:0})
            .to(0.1,{opacity:255})
            .start();

        }
    }

    /** 容量 */
    capacity() {
        return this._bottleData.capacity;
    }

    begin() {
        return this._bottleData.begin;
    }

    distance() {
        return this._bottleData.distance;
    }

    /** 已有球数量 */
    childCount(): number {
        return this.node_ballParent.childrenCount;
    }

    height() {
        return this._bottleData.height;
    }

    /** 是否已满 */
    isFull() {
        return this._full;
    }

    topNodeName(): string {
        if(this.node_ballParent.childrenCount) {
            return this.node_ballParent.children[this.node_ballParent.childrenCount-1].name;
        } else{
            return "";
        }
    }

    check() {
        if(this.childCount() == this.capacity() && this.capacity() != 1) {
            let name = this.node_ballParent.children[0].name;
            for(let i = 1;i < this.childCount();i++) {
                if(this.node_ballParent.children[i].name != name) {
                    this._full = false;
                    return false;;
                }
            }
            this._full = true;

            this.loadAni();

            return true;
        }
        return false;
    }

    async loadAni() {
        let aperture = await LoadFactory.loadNode(AniPath.Aperture);
        aperture.y = (this.node.height-480)/2;
        this.node.addChild(aperture);
        aperture.getComponent(cc.Animation).play("aperture");

        this.scheduleOnce(()=>{
            aperture.active = false;
        }, 0.7);

        let star = await LoadFactory.loadNode(AniPath.Star);           
        this.node.addChild(star);
        star.height = this.node.height;
        star.getComponent(cc.Animation).play("star");

        this.scheduleOnce(()=>{
            star.active = false;
        }, 1.9);

        let mid = await LoadFactory.loadNode(AniPath.Mid);           
        this.node.addChild(mid);
        mid.y = this.node.height - 400;
        mid.getComponent(cc.Animation).play("mid");

        this.scheduleOnce(()=>{
            mid.active = false;
        }, 2.6);

    }


    playAni(index: number) {
        console.log("播放动画");
        this.ani.node.active = true;
        this.scheduleOnce(()=>{
            this.ani.play('fireFlower');
        });
        this.ani.node.y = index*95 -10;
        

        this.unschedule(this._waitSchedule)
        this._waitSchedule = null;
        this._waitSchedule = ()=>{
            this.ani.node.active = false;
        };
        this.scheduleOnce(this._waitSchedule,0.33);
    }



    protected onDestroy(): void {
        this.unschedule(this._waitSchedule);
        this._waitSchedule = null;
    }

    ballNode() {
        return this.node_ballParent;
    }

    start() {

    }


}
