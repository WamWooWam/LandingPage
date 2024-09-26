import { exceptions, simd } from "wasm-feature-detect";

import { Package } from "shared/Package";

// throw on missing features
export async function ensureCapabilitiesAsync(pack: Package): Promise<void> {
    if (!pack.capabilities) return;

    let features = pack.capabilities.filter(c => c.type === "FeatureCapability" && c.ns === "https://wamwoowam.co.uk/appx/2022");
    for (const feature of features) {
        await ensureFeatureCapabilityAsync(feature.name, feature.values);
    }
}

async function ensureFeatureCapabilityAsync(feature: string, values: any): Promise<void> {
    if (feature === "WebAssembly") {
        if (!('WebAssembly' in window)) {
            throw new Error("WebAssembly is not supported in this browser");
        }

        if (!values && !values["Features"]) return;
        for (const feature of values["Features"].split(",")) {
            // weird, but trying to work around an odd issue in older versions of JSC that
            // dont like the sytax if (!await x()) {}
            // this includes the console.log, annoyingly            
            const hasFeature = await ensureWebAssemblyFeatureAsync(feature);
            console.log(`Package required feature ${feature} is ${hasFeature ? "supported" : "not supported"}`);
            if (hasFeature)
                continue;

            throw new Error(`Missing WebAssembly feature: ${feature}`);
        }
    }
}

async function ensureWebAssemblyFeatureAsync(feature: string): Promise<boolean> {
    switch (feature) {
        case "SIMD":
            return await simd();
        case "Exceptions":
            return await exceptions();
        default:
            throw new Error(`Unknown WebAssembly feature: ${feature}`);
    }
}