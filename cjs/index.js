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
var esm_exports = {};
__export(esm_exports, {
  generateGlobTasks: () => generateGlobTasks,
  generateGlobTasksSync: () => generateGlobTasksSync,
  globby: () => globby,
  globbyStream: () => globbyStream,
  globbySync: () => globbySync,
  isDynamicPattern: () => isDynamicPattern,
  isGitIgnored: () => import_ignore2.isGitIgnored,
  isGitIgnoredSync: () => import_ignore2.isGitIgnoredSync
});
module.exports = __toCommonJS(esm_exports);
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var import_merge2 = __toESM(require("merge2"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_dir_glob = __toESM(require("dir-glob"));
var import_ignore = require("./ignore.js");
var import_utilities = require("./utilities.js");
var import_ignore2 = require("./ignore.js");
const assertPatternsInput = (patterns) => {
  if (patterns.some((pattern) => typeof pattern !== "string")) {
    throw new TypeError("Patterns must be a string or an array of strings");
  }
};
const toPatternsArray = (patterns) => {
  patterns = [...new Set([patterns].flat())];
  assertPatternsInput(patterns);
  return patterns;
};
const checkCwdOption = (options) => {
  if (!options.cwd) {
    return;
  }
  let stat;
  try {
    stat = import_node_fs.default.statSync(options.cwd);
  } catch {
    return;
  }
  if (!stat.isDirectory()) {
    throw new Error("The `cwd` option must be a path to a directory");
  }
};
const normalizeOptions = (options = {}) => {
  options = {
    ignore: [],
    expandDirectories: true,
    ...options,
    cwd: (0, import_utilities.toPath)(options.cwd)
  };
  checkCwdOption(options);
  return options;
};
const normalizeArguments = (fn) => async (patterns, options) => fn(toPatternsArray(patterns), normalizeOptions(options));
const normalizeArgumentsSync = (fn) => (patterns, options) => fn(toPatternsArray(patterns), normalizeOptions(options));
const getIgnoreFilesPatterns = (options) => {
  const { ignoreFiles, gitignore } = options;
  const patterns = ignoreFiles ? toPatternsArray(ignoreFiles) : [];
  if (gitignore) {
    patterns.push(import_ignore.GITIGNORE_FILES_PATTERN);
  }
  return patterns;
};
const getFilter = async (options) => {
  const ignoreFilesPatterns = getIgnoreFilesPatterns(options);
  return createFilterFunction(
    ignoreFilesPatterns.length > 0 && await (0, import_ignore.isIgnoredByIgnoreFiles)(ignoreFilesPatterns, { cwd: options.cwd })
  );
};
const getFilterSync = (options) => {
  const ignoreFilesPatterns = getIgnoreFilesPatterns(options);
  return createFilterFunction(
    ignoreFilesPatterns.length > 0 && (0, import_ignore.isIgnoredByIgnoreFilesSync)(ignoreFilesPatterns, { cwd: options.cwd })
  );
};
const createFilterFunction = (isIgnored) => {
  const seen = /* @__PURE__ */ new Set();
  return (fastGlobResult) => {
    const path = fastGlobResult.path || fastGlobResult;
    const pathKey = import_node_path.default.normalize(path);
    const seenOrIgnored = seen.has(pathKey) || isIgnored && isIgnored(path);
    seen.add(pathKey);
    return !seenOrIgnored;
  };
};
const unionFastGlobResults = (results, filter) => results.flat().filter((fastGlobResult) => filter(fastGlobResult));
const unionFastGlobStreams = (streams, filter) => (0, import_merge2.default)(streams).pipe(new import_utilities.FilterStream((fastGlobResult) => filter(fastGlobResult)));
const convertNegativePatterns = (patterns, options) => {
  const tasks = [];
  while (patterns.length > 0) {
    const index = patterns.findIndex((pattern) => (0, import_utilities.isNegativePattern)(pattern));
    if (index === -1) {
      tasks.push({ patterns, options });
      break;
    }
    const ignorePattern = patterns[index].slice(1);
    for (const task of tasks) {
      task.options.ignore.push(ignorePattern);
    }
    if (index !== 0) {
      tasks.push({
        patterns: patterns.slice(0, index),
        options: {
          ...options,
          ignore: [
            ...options.ignore,
            ignorePattern
          ]
        }
      });
    }
    patterns = patterns.slice(index + 1);
  }
  return tasks;
};
const getDirGlobOptions = (options, cwd) => ({
  ...cwd ? { cwd } : {},
  ...Array.isArray(options) ? { files: options } : options
});
const generateTasks = async (patterns, options) => {
  const globTasks = convertNegativePatterns(patterns, options);
  const { cwd, expandDirectories } = options;
  if (!expandDirectories) {
    return globTasks;
  }
  const patternExpandOptions = getDirGlobOptions(expandDirectories, cwd);
  const ignoreExpandOptions = cwd ? { cwd } : void 0;
  return Promise.all(
    globTasks.map(async (task) => {
      let { patterns: patterns2, options: options2 } = task;
      [
        patterns2,
        options2.ignore
      ] = await Promise.all([
        (0, import_dir_glob.default)(patterns2, patternExpandOptions),
        (0, import_dir_glob.default)(options2.ignore, ignoreExpandOptions)
      ]);
      return { patterns: patterns2, options: options2 };
    })
  );
};
const generateTasksSync = (patterns, options) => {
  const globTasks = convertNegativePatterns(patterns, options);
  const { cwd, expandDirectories } = options;
  if (!expandDirectories) {
    return globTasks;
  }
  const patternExpandOptions = getDirGlobOptions(expandDirectories, cwd);
  const ignoreExpandOptions = cwd ? { cwd } : void 0;
  return globTasks.map((task) => {
    let { patterns: patterns2, options: options2 } = task;
    patterns2 = import_dir_glob.default.sync(patterns2, patternExpandOptions);
    options2.ignore = import_dir_glob.default.sync(options2.ignore, ignoreExpandOptions);
    return { patterns: patterns2, options: options2 };
  });
};
const globby = normalizeArguments(async (patterns, options) => {
  const [
    tasks,
    filter
  ] = await Promise.all([
    generateTasks(patterns, options),
    getFilter(options)
  ]);
  const results = await Promise.all(tasks.map((task) => (0, import_fast_glob.default)(task.patterns, task.options)));
  return unionFastGlobResults(results, filter);
});
const globbySync = normalizeArgumentsSync((patterns, options) => {
  const tasks = generateTasksSync(patterns, options);
  const filter = getFilterSync(options);
  const results = tasks.map((task) => import_fast_glob.default.sync(task.patterns, task.options));
  return unionFastGlobResults(results, filter);
});
const globbyStream = normalizeArgumentsSync((patterns, options) => {
  const tasks = generateTasksSync(patterns, options);
  const filter = getFilterSync(options);
  const streams = tasks.map((task) => import_fast_glob.default.stream(task.patterns, task.options));
  return unionFastGlobStreams(streams, filter);
});
const isDynamicPattern = normalizeArgumentsSync(
  (patterns, options) => patterns.some((pattern) => import_fast_glob.default.isDynamicPattern(pattern, options))
);
const generateGlobTasks = normalizeArguments(generateTasks);
const generateGlobTasksSync = normalizeArgumentsSync(generateTasksSync);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateGlobTasks,
  generateGlobTasksSync,
  globby,
  globbyStream,
  globbySync,
  isDynamicPattern,
  isGitIgnored,
  isGitIgnoredSync
});
//# sourceMappingURL=index.js.map
