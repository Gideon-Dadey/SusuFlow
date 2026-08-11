const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch only what Metro needs — not web/api/docs (faster Fast Refresh).
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, "packages", "shared"),
  path.resolve(workspaceRoot, "node_modules"),
];
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
  // Web/pnpm may install React 19.2.x — never bundle that copy into Expo.
  new RegExp(
    `${escapeRegExp(path.join(workspaceRoot, "node_modules", ".pnpm"))}[\\\\/]react@19\\.2[^\\\\/]*[\\\\/]`,
  ),
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

/** One React copy — web/pnpm may hoist 19.2.x, which breaks Expo hooks. */
const reactRoot = path.resolve(projectRoot, "node_modules/react");
const reactDomRoot = path.resolve(projectRoot, "node_modules/react-dom");

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  react: reactRoot,
  "react-dom": reactDomRoot,
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "phosphor-react-native" && fs.existsSync(phosphorEntry)) {
    return { filePath: phosphorEntry, type: "sourceFile" };
  }

  if (moduleName === "react" || moduleName.startsWith("react/")) {
    return {
      filePath: require.resolve(moduleName, { paths: [projectRoot] }),
      type: "sourceFile",
    };
  }
  if (moduleName === "react-dom" || moduleName.startsWith("react-dom/")) {
    return {
      filePath: require.resolve(moduleName, { paths: [projectRoot] }),
      type: "sourceFile",
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
