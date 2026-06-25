const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

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

module.exports = config;
