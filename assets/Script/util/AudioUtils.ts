// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
class AudioUtils {

    private static instance: AudioUtils = null;

    static getInstance() {
        if(AudioUtils.instance === null) {
            AudioUtils.instance = new AudioUtils();
        }
        return AudioUtils.instance;
    }

    playBGM(path: string) {
        if(!Global.playBgm) return;
        this.stopBgm();
        cc.loader.loadRes(path,cc.AudioClip,(err,clip)=>{
            if(err) {
                console.log("路径错误：",path);
                return;
            }
            cc.audioEngine.playMusic(clip,true);
        });
    }

    stopBgm() {
        cc.audioEngine.stopMusic();
    }

    playEffect(path:string) {
        if(!Global.playEffect) return;
        cc.loader.loadRes(path,cc.AudioClip,(err,clip)=>{
            if(err) {
                console.log("路径错误：",path);
                return;
            }
            cc.audioEngine.play(clip,false,1);
        })
    }


    setBgmVolume(volumn: number) {
        cc.audioEngine.setMusicVolume(volumn);
    } 

    setEffectVolume(volume: number) {
        cc.audioEngine.setEffectsVolume(volume);
    }    
}
export const AudioManager = AudioUtils.getInstance();

