var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var utilities_exports = {};
__export(utilities_exports, {
  FilterStream: () => FilterStream,
  isNegativePattern: () => isNegativePattern,
  toPath: () => toPath
});
module.exports = __toCommonJS(utilities_exports);
var import_node_url = require("node:url");
var import_node_stream = require("node:stream");
const toPath = (urlOrPath) => urlOrPath instanceof URL ? (0, import_node_url.fileURLToPath)(urlOrPath) : urlOrPath;
class FilterStream extends import_node_stream.Transform {
  constructor(filter) {
    super({
      objectMode: true,
      transform(data, encoding, callback) {
        callback(void 0, filter(data) ? data : void 0);
      }
    });
  }
}
const isNegativePattern = (pattern) => pattern[0] === "!";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FilterStream,
  isNegativePattern,
  toPath
});
//# sourceMappingURL=utilities.js.map
