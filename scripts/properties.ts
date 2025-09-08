/**
 * scripts/properties から manifest.jsonを自動生成する
 * propertiesは、アドオン間通信においても、識別などに利用する
 */

export type SemVer = {
    major: number; minor: number; patch: number;
    prerelease?: string | undefined; // "preview.3" / "rc.1"
    build?: string | undefined;      // "abc123" (commit)
};

/**
 * 文末に # が記述されている箇所を適宜修正して使用します。  
 * Modify and use where # is written at the end of the sentence as appropriate
 */

export const properties = {
    id: "kairo-template", # // a-z & 0-9 - _
    metadata: { 
        /** 製作者の名前 */
        authors: [
            //"shizuku86"
        ]
    },
    header: {
        name: "Kairo-template", #
        description: "A starter template for developing Minecraft Bedrock addons that rely on Kairo.", #
        version: { 
            major: 1, 
            minor: 0, 
            patch: 0,
            // prerelease: "preview.1",
            // build: "abc123",
        },
        min_engine_version: [ 1,21,100 ],
        uuid: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" #
    },
    resourcepack: {
        name: "Use BP Name",
        description: "Use BP Description",
        uuid: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", #
        module_uuid: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", #
    },
    modules: [
        {
            type: "script",
			language: "javascript",
			entry: "scripts/index.js",
            version: "header.version",
            uuid: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" #
        }
    ],
    dependencies: [
		{
			module_name: "@minecraft/server",
			version: "2.1.0" #
		},
		{
			module_name: "@minecraft/server-ui",
			version: "2.0.0" #
		}
	],
    /** 前提アドオン */
    requiredAddons: {
        /**
         * id: version (string) // "kairo": "1.0.0"
         */
    },
    tags: [
        // "stable",
    ],
}

/**
 * "official" を非公式に付与することは許可されていません。
 * 公認のアドオンには "approved" を付与します。
 * It is not allowed to assign "official" unofficially.
 * For approved addons, assign "approved".
 * 
 */
export const supportedTags: string[] = [
    "official",
    "approved",
    "stable",
    "experimental"
]