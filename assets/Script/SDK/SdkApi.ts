
import EventUtil from "../util/EventUtils";
import GameEventType from "../util/GameEventType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SdkApi {
    static OCPath: string = 'AppController';
    static init() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js初始化调用")
            jsb.reflection.callStaticMethod(this.OCPath, "Init","()V")
        }
    }

    static showBanner() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js显示banner调用")
            jsb.reflection.callStaticMethod(this.OCPath, "showBanner","()V")
        }
    }

    static hideBanner() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js隐藏banner调用")
            jsb.reflection.callStaticMethod(this.OCPath, "hideBanner","()V")
        }
    }

    static preloadReward() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js预加载视频广告调用")
            jsb.reflection.callStaticMethod(this.OCPath, "preloadReward","()V")
        }
    }

    static showNoReward() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js显示视频广告调用")
            //jsb.reflection.callStaticMethod(this.OCPath, "showNoReward","()V")
            jsb.reflection.callStaticMethod(this.OCPath, "showReward","()V")
        } else if(cc.sys.isBrowser) {
            console.log("看广告");
            EventUtil.emit(GameEventType.SHOW_ADS);
        }
    }

    static showInterstitial() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js显示插屏广告调用")
            //jsb.reflection.callStaticMethod(this.OCPath, "showInterstitial","()V")
            jsb.reflection.callStaticMethod(this.OCPath, "showInterstitial","()V")
        } else if(cc.sys.isBrowser) {
            console.log("看广告");
            EventUtil.emit(GameEventType.SHOW_ADS);
        }
    }

    static showReward() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js显示视频广告调用")
            jsb.reflection.callStaticMethod(this.OCPath, "showReward","()V")
        } else if(cc.sys.isBrowser) {
            console.log("看广告");
            EventUtil.emit(GameEventType.SHOW_ADS);
        }
    }

    static purchase(productId: string) {
        if(cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) {
            console.log("------js购买调用")
            jsb.reflection.callStaticMethod(this.OCPath, "purchase","(Ljava/lang/String;)V", productId)
        }
    }
}
