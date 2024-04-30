import type { Importer, NodeishFilesystemSubset } from "@inlang/importer"
import type { ProjectSettings } from "@inlang/project-settings"
import type { AST } from "@inlang/message"
/**
 * Function that resolves (imports and initializes) the plugins.
 */
export type ResolveImportersFunction = (args: {
	importers: Array<Importer>
	settings: ProjectSettings
	nodeishFs: NodeishFilesystemSubset
}) => Promise<{
	data: ResolvedImporterApi
	errors: Array<Error>
}>

export type ResolvedImporterApi = {
	importMessages: (args: {
		settings: ProjectSettings
		nodeishFs: NodeishFilesystemSubset
	}) => Promise<AST.MessageBundle[]>
}