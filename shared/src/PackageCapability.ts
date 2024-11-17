export interface PackageCapability {
    ns: string;
    type: string;
    name: string;
    values: { [key: string]: string };
}
