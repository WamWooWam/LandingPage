import "preact/debug"
import { render } from "preact"
import { PackageRegistry } from "./Data/PackageRegistry";
import { PackageReader } from "./Data/PackageReader";
import { Root } from "./Root";
import './index.css';
import './segoe.css';

const packages = [
  require('../../packages/Socials/AppxManifest.xml').default,
  require('../../packages/Projects/AppxManifest.xml').default,
];

document.addEventListener("DOMContentLoaded", async () => {
  for (const packageXml of packages) {
    let reader = new PackageReader(packageXml)
    let pack = await reader.readPackage();
    PackageRegistry.registerPackage(pack);
  }

  render(<Root/>, document.body);
})
