import type { AddonProperty } from "../AddonPropertyManager";
import type { AddonInitializer } from "../router/init/AddonInitializer";
import { VersionManager } from "../../../utils/VersionManager";
import { DynamicPropertyStorage } from "./DynamicPropertyStorage";
import { VERSION_KEYWORDS } from "../../../constants/version_keywords";

export interface AddonRecords {
    [id: string]: {
        name: string;
        description: [string, string];
        selectedVersion: string;
        versions: string[]
    };
}

export class AddonRecord {
    private constructor(private readonly addonInitializer: AddonInitializer) {}

    public static create(addonInitializer: AddonInitializer): AddonRecord {
        return new AddonRecord(addonInitializer);
    }

    public saveAddons(addons: AddonProperty[]): void {
        const addonRecords: AddonRecords = this.loadAddons();

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

    public loadAddons(): AddonRecords {
        return DynamicPropertyStorage.load("AddonRecords") as AddonRecords;
    }
}