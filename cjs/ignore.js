var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var ignore_exports = {};
__export(ignore_exports, {
  GITIGNORE_FILES_PATTERN: () => GITIGNORE_FILES_PATTERN,
  isGitIgnored: () => isGitIgnored,
  isGitIgnoredSync: () => isGitIgnoredSync,
  isIgnoredByIgnoreFiles: () => isIgnoredByIgnoreFiles,
  isIgnoredByIgnoreFilesSync: () => isIgnoredByIgnoreFilesSync
});
module.exports = __toCommonJS(ignore_exports);
var import_node_process = __toESM(require("node:process"));
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_ignore = __toESM(require("ignore"));
var import_slash = __toESM(require("@esm2cjs/slash"));
var import_utilities = require("./utilities.js");
const ignoreFilesGlobOptions = {
  ignore: [
    "**/node_modules",
    "**/flow-typed",
    "**/coverage",
    "**/.git"
  ],
  absolute: true,
  dot: true
};
const GITIGNORE_FILES_PATTERN = "**/.gitignore";
const applyBaseToPattern = (pattern, base) => (0, import_utilities.isNegativePattern)(pattern) ? "!" + import_node_path.default.posix.join(base, pattern.slice(1)) : import_node_path.default.posix.join(base, pattern);
const parseIgnoreFile = (file, cwd) => {
  const base = (0, import_slash.default)(import_node_path.default.relative(cwd, import_node_path.default.dirname(file.filePath)));
  return file.content.split(/\r?\n/).filter((line) => line && !line.startsWith("#")).map((pattern) => applyBaseToPattern(pattern, base));
};
const toRelativePath = (fileOrDirectory, cwd) => {
  cwd = (0, import_slash.default)(cwd);
  if (import_node_path.default.isAbsolute(fileOrDirectory)) {
    if ((0, import_slash.default)(fileOrDirectory).startsWith(cwd)) {
      return import_node_path.default.relative(cwd, fileOrDirectory);
    }
    throw new Error(`Path ${fileOrDirectory} is not in cwd ${cwd}`);
  }
  return fileOrDirectory;
};
const getIsIgnoredPredicate = (files, cwd) => {
  const patterns = files.flatMap((file) => parseIgnoreFile(file, cwd));
  const ignores = (0, import_ignore.default)().add(patterns);
  return (fileOrDirectory) => {
    fileOrDirectory = (0, import_utilities.toPath)(fileOrDirectory);
    fileOrDirectory = toRelativePath(fileOrDirectory, cwd);
    return ignores.ignores((0, import_slash.default)(fileOrDirectory));
  };
};
const normalizeOptions = (options = {}) => ({
  cwd: (0, import_utilities.toPath)(options.cwd) || import_node_process.default.cwd()
});
const isIgnoredByIgnoreFiles = async (patterns, options) => {
  const { cwd } = normalizeOptions(options);
  const paths = await (0, import_fast_glob.default)(patterns, { cwd, ...ignoreFilesGlobOptions });
  const files = await Promise.all(
    paths.map(async (filePath) => ({
      filePath,
      content: await import_node_fs.default.promises.readFile(filePath, "utf8")
    }))
  );
  return getIsIgnoredPredicate(files, cwd);
};
const isIgnoredByIgnoreFilesSync = (patterns, options) => {
  const { cwd } = normalizeOptions(options);
  const paths = import_fast_glob.default.sync(patterns, { cwd, ...ignoreFilesGlobOptions });
  const files = paths.map((filePath) => ({
    filePath,
    content: import_node_fs.default.readFileSync(filePath, "utf8")
  }));
  return getIsIgnoredPredicate(files, cwd);
};
const isGitIgnored = (options) => isIgnoredByIgnoreFiles(GITIGNORE_FILES_PATTERN, options);
const isGitIgnoredSync = (options) => isIgnoredByIgnoreFilesSync(GITIGNORE_FILES_PATTERN, options);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GITIGNORE_FILES_PATTERN,
  isGitIgnored,
  isGitIgnoredSync,
  isIgnoredByIgnoreFiles,
  isIgnoredByIgnoreFilesSync
});
//# sourceMappingURL=ignore.js.map
