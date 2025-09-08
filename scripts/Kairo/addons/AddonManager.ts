import type { Kairo } from "..";
import type { AddonProperty } from "./AddonPropertyManager";
import { ScriptEventCommandMessageAfterEvent, system, type Player } from "@minecraft/server";
import { AddonReceiver } from "./router/AddonReceiver";

export type RegistrationState = "registered" | "unregistered" | "missing_requiredAddons";

export interface AddonData {
    id: string;
    name: string;
    description: [string, string];
    isActive: boolean;
    isEditable: boolean;
    selectedVersion: string;
    activeVersion: string;
    versions: {
        [version: string]: {
            isRegistered: boolean;
            registrationState: RegistrationState;
            canInitActivate?: boolean;
            sessionId?: string;
            tags?: string[];
            dependencies?: {
                module_name: string;
                version: string;
            }[];
            requiredAddons?: {
                [name: string]: string;
            };
        }
    }
}

export class AddonManager {
    private readonly receiver: AddonReceiver;

    private constructor(private readonly kairo: Kairo) {
        this.receiver = AddonReceiver.create(this);
    }
    public static create(kairo: Kairo): AddonManager {
        return new AddonManager(kairo);
    }

    public getSelfAddonProperty(): AddonProperty {
        return this.kairo.getSelfAddonProperty();
    }

    public subscribeReceiverHooks(): void {
        system.afterEvents.scriptEventReceive.subscribe(this.receiver.handleScriptEvent);
    }

    public _activateAddon(): void {
        this.kairo._activateAddon();
    }

    public _deactivateAddon(): void {
        this.kairo._deactivateAddon();
    }

    public _scriptEvent(message: string): void {
        this.kairo._scriptEvent(message);
    }
}