
import { EClickAdsPos, StorageName } from "../GameData";

import { Button } from "../Button";
import { Global } from "../Global";
import { StorageUtils } from "../util/StorageUtils";
import Api from "../Api/Api";
import EventUtil from "../util/EventUtils";
import GameEventType from "../util/GameEventType";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SkipLevel extends cc.Component {

   
    @property(Button)
    btn_yes: Button = null;

    @property(Button)
    btn_skip: Button = null;

    protected onEnable(): void {
        EventUtil.on(GameEventType.SHOW_ADS, this.showAdsCall, this);
    }

    protected onDisable(): void {
        EventUtil.off(GameEventType.SHOW_ADS, this.showAdsCall, this);
    }

    showAdsCall() {
        if(Global.adsType == EClickAdsPos.goldUnlockSkin) {
            this.skipGame();
        }
    }

    start () {

        this.btn_yes.onTouchEnd(()=>{
            this.node.destroy();    
        });

        this.btn_skip.onTouchEnd(()=>{
            if(Global.isOpenAds) {
                if(Global.userInfo.gold >= 20) {
                    Global.userInfo.gold -= 20;
                    this.skipGame();
                } else {
                    Global.adsType = EClickAdsPos.goldUnlockSkin;
                    Api.showReward();
                }
            } else {
                this.skipGame();
            }
        });
    }

    skipGame() {
        Global.userInfo.level++;
        Global.chooseLevel++;
        StorageUtils.setStorageJson(StorageName.userInfo, Global.userInfo);
        cc.director.loadScene("Game");
    }

    // update (dt) {}
}
