
import EventUtil from "../util/EventUtils";
import GameEventType from "../util/GameEventType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SdkApi {
    static androidPath: string = 'org/cocos2dx/javascript/AppActivity';
    static init() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js初始化调用")
            jsb.reflection.callStaticMethod(this.androidPath, "Init","()V")
        }
    }

    static showBanner() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js显示banner调用")
            jsb.reflection.callStaticMethod(this.androidPath, "showBanner","()V")
        }
    }

    static hideBanner() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js隐藏banner调用")
            jsb.reflection.callStaticMethod(this.androidPath, "hideBanner","()V")
        }
    }

    static preloadReward() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js预加载视频广告调用")
            jsb.reflection.callStaticMethod(this.androidPath, "preloadReward","()V")
        }
    }

    static showNoReward() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js显示视频广告调用")
            //jsb.reflection.callStaticMethod(this.androidPath, "showNoReward","()V")
            jsb.reflection.callStaticMethod(this.androidPath, "showReward","()V")
        } else if(cc.sys.isBrowser) {
            console.log("看广告");
            EventUtil.emit(GameEventType.SHOW_ADS);
        }
    }

    static showInterstitial() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js显示插屏广告调用")
            //jsb.reflection.callStaticMethod(this.androidPath, "showInterstitial","()V")
            jsb.reflection.callStaticMethod(this.androidPath, "showInterstitial","()V")
        } else if(cc.sys.isBrowser) {
            console.log("看广告");
            EventUtil.emit(GameEventType.SHOW_ADS);
        }
    }

    static showReward() {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js显示视频广告调用")
            jsb.reflection.callStaticMethod(this.androidPath, "showReward","()V")
        } else if(cc.sys.isBrowser) {
            console.log("看广告");
            EventUtil.emit(GameEventType.SHOW_ADS);
        }
    }

    static tjReport(str) {
        if(cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative) {
            console.log("------js上传日志", str);
            jsb.reflection.callStaticMethod(this.androidPath, "tjReport","(Ljava/lang/String;)V", str);
        }
    }


}
