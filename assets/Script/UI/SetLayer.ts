

import { Button } from "../Button";
import { Sound, StorageName, UIPath } from "../GameData";
import { Global } from "../Global";
import { AudioManager } from "../util/AudioUtils";
import LoadFactory, { OpenPrefabAni } from "../util/LoadFactory";
import { StorageUtils } from "../util/StorageUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SetLayer extends cc.Component {

    @property(Button)
    btn_close: Button = null;

    @property(Button)
    btn_music: Button = null;

    @property(Button)
    btn_effect: Button = null;

    @property(Button)
    btn_contact: Button = null;

    @property(Button)
    btn_policy: Button = null;


    protected onLoad(): void {
        this.initView();
    }

    initView() {
        this.btn_music.node.getChildByName('ON').active = Global.playBgm;
        this.btn_music.node.getChildByName('OFF').active = !Global.playBgm;

        this.btn_effect.node.getChildByName('ON').active = Global.playEffect;
        this.btn_effect.node.getChildByName('OFF').active = !Global.playEffect;
    }

    start () {

        this.btn_close.onTouchEnd(()=>{
            this.node.destroy();
        });

        this.btn_contact.onTouchEnd(()=>{
            LoadFactory.loadPrefabPanel({path:UIPath.ContactLayer, ani: OpenPrefabAni.Scale});
        })

        this.btn_policy.onTouchEnd(()=>{
            LoadFactory.loadPrefabPanel({path:UIPath.PolicyLayer, ani: OpenPrefabAni.Scale});
        });

        this.btn_music.onTouchEnd(()=>{
            Global.playBgm = !Global.playBgm;
            this.btn_music.node.getChildByName('ON').active = Global.playBgm;
            this.btn_music.node.getChildByName('OFF').active = !Global.playBgm;
    
            StorageUtils.setStorage(StorageName.bgmVolume,Global.playBgm);
            Global.playBgm ? AudioManager.playBGM(Sound.loginBgm):AudioManager.stopBgm();
        });

        this.btn_effect.onTouchEnd(()=>{
            Global.playEffect = !Global.playEffect;
            this.btn_effect.node.getChildByName('ON').active = Global.playEffect;
            this.btn_effect.node.getChildByName('OFF').active = !Global.playEffect;
            StorageUtils.setStorage(StorageName.effectVolume,Global.playEffect);
        });

    }

    // update (dt) {}
}
