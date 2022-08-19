var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_node_process = __toESM(require("node:process"));
var import_node_fs = __toESM(require("node:fs"));
var import_node_path = __toESM(require("node:path"));
var import_node_url = require("node:url");
var import_benchmark = __toESM(require("benchmark"));
var import_rimraf = __toESM(require("rimraf"));
var globbyMainBranch = __toESM(require("@globby/main-branch"));
var import_glob_stream = __toESM(require("glob-stream"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_index = require("./index.js");
const import_meta = {};
const __dirname = import_node_path.default.dirname((0, import_node_url.fileURLToPath)(import_meta.url));
const BENCH_DIR = "bench";
const runners = [
  {
    name: "globby async (working directory)",
    run: import_index.globby
  },
  {
    name: "globby async (upstream/main)",
    run: globbyMainBranch.globby
  },
  {
    name: "globby sync (working directory)",
    run: import_index.globbySync
  },
  {
    name: "globby sync (upstream/main)",
    run: globbyMainBranch.globbySync
  },
  {
    name: "globby stream (working directory)",
    run: (patterns) => new Promise((resolve) => {
      (0, import_index.globbyStream)(patterns).on("data", () => {
      }).on("end", resolve);
    })
  },
  {
    name: "globby stream (upstream/main)",
    run: (patterns) => new Promise((resolve) => {
      globbyMainBranch.globbyStream(patterns).on("data", () => {
      }).on("end", resolve);
    })
  },
  {
    name: "glob-stream",
    run: (patterns) => new Promise((resolve) => {
      (0, import_glob_stream.default)(patterns).on("data", () => {
      }).on("end", resolve);
    })
  },
  {
    name: "fast-glob async",
    run: import_fast_glob.default
  },
  {
    name: "fast-glob sync",
    run: import_fast_glob.default.sync
  }
];
const benchs = [
  {
    name: "negative globs (some files inside dir)",
    patterns: [
      "a/*",
      "!a/c*"
    ]
  },
  {
    name: "negative globs (whole dir)",
    patterns: [
      "a/*",
      "!a/**"
    ]
  },
  {
    name: "multiple positive globs",
    patterns: [
      "a/*",
      "b/*"
    ]
  }
];
const before = () => {
  import_node_process.default.chdir(__dirname);
  import_rimraf.default.sync(BENCH_DIR);
  import_node_fs.default.mkdirSync(BENCH_DIR);
  import_node_process.default.chdir(BENCH_DIR);
  const directories = ["a", "b"].map((directory) => `${directory}/`);
  for (const directory of directories) {
    import_node_fs.default.mkdirSync(directory);
    for (let i = 0; i < 500; i++) {
      import_node_fs.default.writeFileSync(directory + (i < 100 ? "c" : "d") + i, "");
    }
  }
};
const after = () => {
  import_node_process.default.chdir(__dirname);
  import_rimraf.default.sync(BENCH_DIR);
};
const suites = [];
for (const { name, patterns } of benchs) {
  const suite = new import_benchmark.default.Suite(name, {
    onStart() {
      before();
      console.log(`[*] Started Benchmarks "${this.name}"`);
    },
    onCycle(event) {
      console.log(`[+] ${String(event.target)}`);
    },
    onComplete() {
      after();
      console.log(`
Fastest is ${this.filter("fastest").map("name")} 
`);
    }
  });
  for (const { name: name2, run: run2 } of runners) {
    suite.add(name2, run2.bind(void 0, patterns));
  }
  suites.push(suite);
}
let index = 0;
const run = (suite) => {
  suite.on("complete", () => {
    const next = suites[++index];
    if (next) {
      run(next);
    }
  });
  suite.run({ async: true });
};
run(suites[0]);
//# sourceMappingURL=bench.js.map
