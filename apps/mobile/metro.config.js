const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo: Metro must see the workspace, but block unrelated apps from resolution.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blockDirectory(...segments) {
  const abs = path.join(...segments);
  const pattern = escapeRegExp(abs).replace(/\\\\/g, "[\\\\/]");
  return new RegExp(`^${pattern}[\\\\/].*`);
}

const existingBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existingBlockList)
    ? existingBlockList
    : existingBlockList
      ? [existingBlockList]
      : []),
  blockDirectory(workspaceRoot, "apps", "web"),
  blockDirectory(workspaceRoot, "apps", "api"),
  blockDirectory(workspaceRoot, "apps", "worker"),
  blockDirectory(workspaceRoot, "infrastructure"),
  blockDirectory(workspaceRoot, "docs"),
];

/**
 * phosphor-react-native ships a `react-native` entry at `src/index.tsx`.
 * Metro on Windows/monorepos sometimes fails to resolve that source path even
 * when the file exists — pin to the compiled CommonJS build instead.
 */
const phosphorEntry = path.resolve(
  projectRoot,
  "node_modules/phosphor-react-native/lib/commonjs/index.js",
);
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "phosphor-react-native" && fs.existsSync(phosphorEntry)) {
    return { filePath: phosphorEntry, type: "sourceFile" };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
