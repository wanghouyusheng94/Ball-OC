export namespace StorageUtils {

    export let clearStorageByName = (keyName)=>{
        cc.sys.localStorage.removeItem(keyName);
    }

    /** 存储变量 */
    export let setStorage = (keyName,data)=>{
        cc.sys.localStorage.setItem(keyName, data);
    }

    export let getStorage = (keyName)=>{
        let value = cc.sys.localStorage.getItem(keyName);
        if(value) {
            if(value === "true") return true;
            else if(value === "false") return false;
            if(!isNaN(value)) {
                return parseInt(value);
            }
        } else {
            return value;
        }
    }

    /** 存储对象 */
    export let setStorageJson = (keyName, data)=>{
        cc.sys.localStorage.setItem(keyName, JSON.stringify(data??{}));
    }

    export let getStorageJson = (keyName)=>{
        let data = cc.sys.localStorage.getItem(keyName);
        if (data instanceof Array && data.length < 1) { return null; }
        if (data) { return JSON.parse(data) }
        return null;
    }
}