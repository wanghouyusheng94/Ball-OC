
import { PrefabPath, UIPath, ZIndex } from "../GameData";

export enum OpenPrefabAni {
    None,
    Scale,
    Fade,
}

type TPrefabInfo = {
    path: string,
    ani?: OpenPrefabAni
}

export default class LoadFactory {
    static loadPrefabPanel(info: TPrefabInfo): Promise<cc.Node> {
        return new Promise((resolve,reject)=>{
            cc.loader.loadRes(info.path, cc.Prefab,(err,asset:cc.Prefab)=>{
                if(err) {
                    console.log('err:',err);
                    reject(err);
                    return;
                }
                let node = cc.instantiate(asset);
                node.setParent(cc.director.getScene().getChildByName('Canvas'));
                node.zIndex = ZIndex.layer;
                if(info?.ani === OpenPrefabAni.Scale) {
                    const bg = node.getChildByName('bg');
                    bg.scale = 0;
                    cc.tween(bg)
                    .to(0.5,{scale:1},{easing: cc.easing.backOut}).start();
                } else if(info?.ani === OpenPrefabAni.Fade) {
                    const bg = node.getChildByName('bg');
                    bg.opacity = 0;
                    cc.tween(bg)
                    .to(0.5,{opacity:255}).start();
                }
                resolve(node);
            })
        });
    }

    static loadNode(path: string): Promise<cc.Node> {
        return new Promise((resolve, reject)=>{
            cc.loader.loadRes(path, cc.Prefab,(err,asset:cc.Prefab)=>{
                if(err) {
                    console.log('err:',err);
                    reject(err);
                    return;
                }
                let node = cc.instantiate(asset);
                resolve(node);
            })
        })
    }

    static loadTipsPanel(tipStr: string) {
        cc.loader.loadRes(UIPath.Tips,cc.Prefab,(err,asset:cc.Prefab)=>{
            if(err) {
                console.log("err:",err);
                return;
            }
            let node = cc.instantiate(asset)
            node.setParent(cc.director.getScene().getChildByName("Canvas"));
            node.zIndex = ZIndex.tips;
            node.getChildByName("txt_info").getComponent(cc.Label).string = tipStr;
            node.setPosition(cc.v2(0,-100))
            cc.tween(node)
            .to(0.5,{position:cc.v3(0,50)})
            .delay(1)
            .call(()=>{
                node.destroy();
            })
            .start();
        });
    }

    static async loadSprite(path: string): Promise<cc.SpriteFrame> {
        return new Promise((resolve,reject)=>{
            cc.loader.loadRes(path,cc.SpriteFrame,(err,asset: cc.SpriteFrame)=>{
                if(err) {
                    console.log("err:",err);
                    reject(err);
                    return;
                }
                resolve(asset);
            });
        });
    }

    static loadText(path: string): Promise<string> {
        return new Promise((resolve,reject)=>{
            cc.loader.loadRes(path,cc.TextAsset,(err,asset: cc.TextAsset)=>{
                if(err) {
                    console.log("err:",err);
                    reject(err);
                    return;
                }
                resolve(asset.text);
            });
        })
    }

    static loadJson(path: string): Promise<cc.JsonAsset> {
        return new Promise((resolve,reject)=>{
            cc.loader.loadRes(path,cc.JsonAsset,(err,asset: cc.JsonAsset)=>{
                if(err) {
                    console.log("err:",err);
                    reject(err);
                    return;
                }
                resolve(asset.json);
            });
        })
    }

}
