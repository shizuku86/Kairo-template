import { VersionManager } from "../../../utils/VersionManager";
import { DynamicPropertyStorage } from "./DynamicPropertyStorage";
import { VERSION_KEYWORDS } from "../../../constants/version_keywords";
export class AddonRecord {
    constructor(addonInitializer) {
        this.addonInitializer = addonInitializer;
    }
    static create(addonInitializer) {
        return new AddonRecord(addonInitializer);
    }
    saveAddons(addons) {
        const addonRecords = this.loadAddons();
        addons.forEach(addon => {
            const { id, name, version } = addon;
            const vStr = VersionManager.toVersionString(version);
            if (!addonRecords[id]) {
                addonRecords[id] = {
                    name: name,
                    description: ["0.0.0", ""],
                    selectedVersion: VERSION_KEYWORDS.LATEST,
                    versions: []
                };
            }
            if (VersionManager.compare(addonRecords[id].description[0], vStr) === -1) {
                addonRecords[id].description[0] = vStr;
                addonRecords[id].description[1] = addon.description;
            }
            addonRecords[id].versions.push(vStr);
        });
        DynamicPropertyStorage.save("AddonRecords", addonRecords);
    }
    loadAddons() {
        return DynamicPropertyStorage.load("AddonRecords");
    }
}
