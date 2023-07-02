import "preact/debug"
import { render } from "preact"
import { Start } from './Start';
import { PackageRegistry } from "./Data/PackageRegistry";
import { PackageReader } from "./Data/PackageReader";
import './index.css';
import './segoe.css';

const packages = [
  require('../../packages/Socials/AppxManifest.xml').default,
];

document.addEventListener("DOMContentLoaded", async () => {
  for (const packageXml of packages) {
    let reader = new PackageReader(packageXml)
    let pack = await reader.readPackage();
    PackageRegistry.registerPackage(pack);
  }

  render(<Start />, document.body);
})