#!/bin/bash

mkdir -p esm cjs
mv {utilities,index,bench,ignore}.js esm/
mv index.d.ts esm/index.d.ts
mv index.test-d.ts esm/index.test-d.ts

echo '{"type":"module"}' > tests/package.json

# Replace module imports in all ts files
readarray -d '' files < <(find {esm,tests} \( -name "*.js" -o -name "*.ts" \) -print0)
function replace_imports () {
	from=$1
	to="${2:-@esm2cjs/$from}"
	for file in "${files[@]}" ; do
		sed -i "s#'$from'#'$to'#g" "$file"
	done
}
# replace_imports "FROM" "@esm2cjs/TO"
replace_imports "slash"

PJSON=$(cat package.json | jq --tab '
	del(.type)
	| .description = .description + ". This is a fork of " + .repository + ", but with CommonJS support."
	| .repository = "esm2cjs/" + .name
	| .name |= "@esm2cjs/" + .
	| .author = { "name": "Dominic Griesel", "email": "d.griesel@gmx.net" }
	| .publishConfig = { "access": "public" }
	| .funding = "https://github.com/sponsors/AlCalzone"
	| .main = "cjs/index.js"
	| .module = "esm/index.js"
	| .files = ["cjs/", "esm/"]
	| .exports = {}
	| .exports["."].import = "./esm/index.js"
	| .exports["."].require = "./cjs/index.js"
	| .exports["./package.json"] = "./package.json"
	| .types = "esm/index.d.ts"
	| .typesVersions = {}
	| .typesVersions["*"] = {}
	| .typesVersions["*"]["esm/index.d.ts"] = ["esm/index.d.ts"]
	| .typesVersions["*"]["cjs/index.d.ts"] = ["esm/index.d.ts"]
	| .typesVersions["*"]["*"] = ["esm/*"]
	| .scripts["to-cjs"] = "esm2cjs --in esm --out cjs -t node12"
	| del(.scripts.test)
	| .xo = {ignores: ["cjs", "tests", "fixtures", "**/*.test-d.ts", "**/*.d.ts"]}

	| .dependencies["@esm2cjs/slash"] = .dependencies["slash"]
	| del(.dependencies["slash"])
	| del(.devDependencies["@globby/main-branch"])
	| del(.devDependencies.ava)
	| del(.devDependencies.tsd)
	| del(.devDependencies.xo)
')
# Placeholder for custom deps:
	# | .dependencies["@esm2cjs/DEP"] = .dependencies["DEP"]
	# | del(.dependencies["DEP"])

echo "$PJSON" > package.json

# Update package.json -> version if upstream forgot to update it
if [[ ! -z "${TAG}" ]] ; then
	VERSION=$(echo "${TAG/v/}")
	PJSON=$(cat package.json | jq --tab --arg VERSION "$VERSION" '.version = $VERSION')
	echo "$PJSON" > package.json
fi

npm i -D @alcalzone/esm2cjs
npm run to-cjs
npm uninstall -D @alcalzone/esm2cjs

PJSON=$(cat package.json | jq --tab 'del(.scripts["to-cjs"])')
echo "$PJSON" > package.json