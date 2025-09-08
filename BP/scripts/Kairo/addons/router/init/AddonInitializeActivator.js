import { VERSION_KEYWORDS } from "../../../../constants/version_keywords";
import { VersionManager } from "../../../../utils/VersionManager";
;
export class AddonInitializeActivator {
    constructor(addonInitializer) {
        this.addonInitializer = addonInitializer;
        this.pendingRegistration = new Map();
        this.canRegisterAddons = new Set();
        this.visiting = new Set();
    }
    static create(addonInitializer) {
        return new AddonInitializeActivator(addonInitializer);
    }
    initActivateAddons(addons) {
        const addonRecords = this.addonInitializer.getAddonRecords();
        Object.entries(addonRecords).forEach(([id, record]) => {
            this.initAddonData(id, record.name, record.description, record.selectedVersion, record.versions);
        });
        addons.forEach(addon => {
            this.enqueuePendingRegistration(addon);
        });
        addons.forEach(addon => {
            this.updateAddonRegistrationState(addon);
        });
        this.addonInitializer.getAddonsData().forEach((data, id) => {
            this.activateSelectedVersion(id);
            if (data.isActive) {
                const activeVersionData = data.versions[data.activeVersion];
                const sessionId = activeVersionData?.sessionId;
                if (!sessionId)
                    return;
                this.addonInitializer.sendActiveRequest(sessionId);
            }
        });
        this.pendingRegistration.clear();
        this.canRegisterAddons.clear();
        this.visiting.clear();
    }
    initAddonData(id, name, description, selectedVersion, versions) {
        const sortedVersions = versions.sort((a, b) => VersionManager.compare(b, a));
        const addonData = {
            id,
            name,
            description,
            isActive: false,
            isEditable: false,
            selectedVersion,
            activeVersion: "",
            versions: {}
        };
        sortedVersions.forEach(version => {
            addonData.versions[version] = {
                isRegistered: false,
                registrationState: "unregistered"
            };
        });
        this.addonInitializer.getAddonsData().set(id, addonData);
        const pendingData = {
            id,
            selectedVersion,
            versions: {}
        };
        this.pendingRegistration.set(id, pendingData);
    }
    enqueuePendingRegistration(addon) {
        const pendingData = this.pendingRegistration.get(addon.id);
        if (!pendingData)
            return;
        const version = VersionManager.toVersionString(addon.version);
        pendingData.versions[version] = {
            isRegistered: true,
            requiredAddons: addon.requiredAddons ?? {}
        };
    }
    updateAddonRegistrationState(addon) {
        const addonData = this.addonInitializer.getAddonsData().get(addon.id);
        if (!addonData)
            return;
        const version = VersionManager.toVersionString(addon.version);
        const isRegisterable = this.checkRequiredAddons(addon.id, version, addon.requiredAddons);
        let registrationState = isRegisterable
            ? "registered"
            : "missing_requiredAddons";
        addonData.versions[version] = {
            isRegistered: isRegisterable,
            canInitActivate: this.checkRequiredAddonsForActivation(addon.requiredAddons),
            registrationState,
            sessionId: addon.sessionId,
            tags: addon.tags,
            dependencies: addon.dependencies,
            requiredAddons: addon.requiredAddons
        };
    }
    checkRequiredAddons(id, version, requiredAddons) {
        const selfKey = this.makeKey(id, version);
        if (this.canRegisterAddons.has(selfKey))
            return true;
        if (this.visiting.has(selfKey))
            return false;
        this.visiting.add(selfKey);
        try {
            for (const [requiredId, requiredVersion] of Object.entries(requiredAddons)) {
                const requiredAddonData = this.pendingRegistration.get(requiredId);
                if (!requiredAddonData)
                    return false;
                const isRequiredRegistered = Object.entries(requiredAddonData.versions).some(([candidateVersion, data]) => {
                    const requiredAddons = data.requiredAddons;
                    if (!requiredAddons)
                        return false;
                    if (!data.isRegistered)
                        return false;
                    return VersionManager.compare(candidateVersion, requiredVersion) >= 0
                        && this.checkRequiredAddons(requiredAddonData.id, candidateVersion, requiredAddons);
                });
                if (!isRequiredRegistered)
                    return false;
            }
            this.canRegisterAddons.add(selfKey);
            return true;
        }
        finally {
            this.visiting.delete(selfKey);
        }
    }
    checkRequiredAddonsForActivation(requiredAddons) {
        for (const [requiredId, requiredVersion] of Object.entries(requiredAddons)) {
            const requiredAddonData = this.pendingRegistration.get(requiredId);
            if (!requiredAddonData)
                return false;
            const requiredSelectedVersion = requiredAddonData.selectedVersion === VERSION_KEYWORDS.LATEST
                ? this.getLatestPreferStableVersionInPending(requiredId)
                : requiredAddonData.selectedVersion;
            if (!requiredSelectedVersion)
                return false;
            const isVersionGreater = VersionManager.compare(requiredSelectedVersion, requiredVersion) >= 0;
            if (!isVersionGreater)
                return false;
        }
        return true;
    }
    makeKey(id, version) {
        return `${id}@${version}`;
    }
    getLatestPreferStableVersionInPending(id) {
        const addonData = this.pendingRegistration.get(id);
        if (!addonData)
            return undefined;
        const sorted = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v])
            .sort((a, b) => VersionManager.compare(b, a));
        if (sorted.length === 0)
            return undefined;
        const stable = sorted.find(v => !VersionManager.fromString(v).prerelease);
        return stable ?? sorted[0];
    }
    activateLatestVersion(id) {
        const addonData = this.addonInitializer.getAddonsData().get(id);
        if (!addonData)
            return;
        const sorted = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered && addonData.versions[v]?.canInitActivate)
            .sort((a, b) => VersionManager.compare(b, a));
        if (sorted.length === 0)
            return;
        const stable = sorted.find(v => !VersionManager.fromString(v).prerelease);
        const activeVersion = stable ?? sorted[0];
        this.initActivation(addonData, activeVersion);
    }
    activateSelectedVersion(id) {
        const addonData = this.addonInitializer.getAddonsData().get(id);
        if (!addonData)
            return;
        if (addonData.selectedVersion === VERSION_KEYWORDS.LATEST) {
            this.activateLatestVersion(id);
            return;
        }
        const selectedVersion = Object.keys(addonData.versions)
            .find(v => v === addonData.selectedVersion
            && addonData.versions[v]?.isRegistered
            && addonData.versions[v]?.canInitActivate);
        if (!selectedVersion)
            return;
        this.initActivation(addonData, selectedVersion);
    }
    initActivation(addonData, activeVersion) {
        addonData.activeVersion = activeVersion;
        addonData.isActive = true;
    }
}
