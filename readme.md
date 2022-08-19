# @esm2cjs/globby

This is a fork of https://github.com/sindresorhus/globby, but automatically patched to support ESM **and** CommonJS, unlike the original repository.

## Install

You can use an npm alias to install this package under the original name:

```
npm i globby@npm:@esm2cjs/globby
```

```jsonc
// package.json
"dependencies": {
    "globby": "npm:@esm2cjs/globby"
}
```

but `npm` might dedupe this incorrectly when other packages depend on the replaced package. If you can, prefer using the scoped package directly:

```
npm i @esm2cjs/globby
```

```jsonc
// package.json
"dependencies": {
    "@esm2cjs/globby": "^ver.si.on"
}
```

## Usage

```js
// Using ESM import syntax
import { globby } from "@esm2cjs/globby";

// Using CommonJS require()
const { globby } = require("@esm2cjs/globby");
```

For more details, please see the original [repository](https://github.com/sindresorhus/globby).

## Sponsoring

To support my efforts in maintaining the ESM/CommonJS hybrid, please sponsor [here](https://github.com/sponsors/AlCalzone).

To support the original author of the module, please sponsor [here](https://github.com/sindresorhus/globby).
