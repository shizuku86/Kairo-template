import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonInitializer } from "./AddonInitializer";
import { ScoreboardManager } from "../../../../utils/ScoreboardManager";
import { SCRIPT_EVENT_IDS } from "../../../../constants/scriptevent";
import { SCOREBOARD_NAMES } from "../../../../constants/scoreboard";

/**
 * 各アドオンが、ルーターからのリクエストを受け取るためのクラス
 * 受け取った initializeRequest を、そのまま AddonInitializeResponseへ流します
 * 
 * A class responsible for receiving requests from the router in each addon.
 * Forwards the received initializeRequest directly to AddonInitializeResponse.
 */
export class AddonInitializeReceive {
    private constructor(private readonly addonInitializer: AddonInitializer) {}

    public static create(addonInitializer: AddonInitializer): AddonInitializeReceive {
        return new AddonInitializeReceive(addonInitializer);
    }

    public handleScriptEvent = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message } = ev;

        switch (id) {
            case SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_REQUEST:
                this.handleInitializeRequest();
                break;
            case SCRIPT_EVENT_IDS.REQUEST_RESEED_SESSION_ID:
                this.handleRequestReseedId(message);
                break;
            case SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE:
                this.addonInitializer.unsubscribeClientHooks();
                break;
        }
    }

    private handleInitializeRequest(): void {
        const addonCounter = ScoreboardManager.ensureObjective(SCOREBOARD_NAMES.ADDON_COUNTER);
        addonCounter.addScore(SCOREBOARD_NAMES.ADDON_COUNTER, 1);
        this.addonInitializer.setRegistrationNum(addonCounter.getScore(SCOREBOARD_NAMES.ADDON_COUNTER) ?? 0);

        this.addonInitializer.sendResponse();
    }

    private handleRequestReseedId(message: string): void {
        const registrationNum = this.addonInitializer.getRegistrationNum();
        if (message !== registrationNum.toString()) return;

        this.addonInitializer.refreshSessionId();
        this.addonInitializer.sendResponse();
    }
}