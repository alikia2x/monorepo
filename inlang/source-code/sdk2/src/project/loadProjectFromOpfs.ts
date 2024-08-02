import { Kysely, ParseJSONResultsPlugin } from "kysely"
import { SQLocalKysely } from "sqlocal/kysely"
import type { Database } from "../schema/schema.js"
import { openLixFromOpfs } from "@lix-js/sdk"
import { deepmerge } from "deepmerge-ts"
import { loadPlugins } from "../plugin/loadPlugins.js"
import type { InlangPlugin2, ResourceFile } from "../plugin/schema.js"
import type { ProjectSettings } from "../schema/settings.js"

/**
 *
 */
export async function loadProjectFromOpfs(args: { path: string }) {
	const lix = await openLixFromOpfs({ path: args.path })

	const { dialect, sql } = new SQLocalKysely({
		storage: {
			type: "memory",
		},
	})

	const db = new Kysely<Database>({
		dialect,
		plugins: [new ParseJSONResultsPlugin()],
	})

	const settingsFile = await lix.db
		.selectFrom("file")
		.select("data")
		.where("path", "=", "/settings.json")
		.executeTakeFirstOrThrow()

	let settings = JSON.parse(new TextDecoder().decode(settingsFile.data)) as ProjectSettings

	const plugins = await loadPlugins({ settings })

	return {
		db,
		plugins,
		importFiles: (args: { pluginKey: InlangPlugin2["key"]; files: ResourceFile }) => {
			args
			throw new Error("Not implemented")
		},
		exportFiles: (args: { pluginKey: InlangPlugin2["key"] }) => {
			args
			throw new Error("Not implemented")
		},
		settings: {
			get: () => settings,
			set: async (newSettings: Partial<ProjectSettings>) => {
				// merge settings
				const merged = deepmerge(settings, newSettings)
				// save settings in lix
				await lix.db
					.updateTable("file")
					.where("path", "is", "/settings.json")
					.set({
						data: await new Blob([JSON.stringify(merged, undefined, 2)]).arrayBuffer(),
					})
					.execute()
				// if successful, update local settings
				settings = merged as ProjectSettings
			},
		},
		toBlob: () => lix.toBlob,
		sql,
		lix,
	}
}