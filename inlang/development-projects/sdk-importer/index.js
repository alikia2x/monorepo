import { loadProjectFromDirectoryInMemory, selectBundleNested } from "@inlang/sdk"
import icu1Importer from "@inlang/plugin-icu1"
import fs from "node:fs/promises"
import path from "node:path"

const project = await loadProjectFromDirectoryInMemory({
	_mockPlugins: {
		"local:@inlang/icu1-importer": icu1Importer,
	},
	path: path.join(process.cwd(), "project.inlang"),
	fs: fs,
})

// get bundles
const bundles = await selectBundleNested(project.db).selectAll().execute()
console.log(JSON.stringify(bundles, undefined, 2))
