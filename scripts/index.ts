import { Kairo } from "./Kairo/index";

async function main(): Promise<void> {
    Kairo.init(); // client
}

Kairo.onActivate = () => {
    /**
     * ここにアドオン有効化時の初期化処理を書く
     * Write the initialization logic executed when the addon becomes active
     */
};

Kairo.onDeactivate = () => {
    /**
     * ここにアドオン無効化時の終了処理を書く
     * 基本的には初期化時の処理を無効化するように
     * Write the shutdown/cleanup logic executed when the addon becomes deactive
     * In principle, undo/disable what was done during initialization
     */
};

Kairo.onScriptEvent = () => {
    /**
     * ここにはアドオンが scriptEvent を受け取った際の処理を書く
     * 利用できるプロパティは { message } のみ
     * Write the handler logic for when the addon receives a scriptEvent
     * The only available property is { message }
     */
};

main();