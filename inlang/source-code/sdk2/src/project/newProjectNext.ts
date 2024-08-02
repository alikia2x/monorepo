import { newLixFile, openLixInMemory, uuidv4 } from "@lix-js/sdk"
import type { ProjectSettings } from "../schema/settings.js"
import { contentFromDatabase, createDialect, createInMemoryDatabase } from "sqlite-wasm-kysely"
import { Kysely, sql } from "kysely"

/**
 * Creates a new inlang project.
 *
 * The app is responsible for saving the project "whereever"
 * e.g. the user's computer, cloud storage, or OPFS in the browser.
 */
export async function newProject(): Promise<Blob> {
	const sqlite = await createInMemoryDatabase({
		readOnly: false,
	})
	const db = new Kysely({
		dialect: createDialect({
			database: sqlite,
		}),
	})

	try {
		await sql`
CREATE TABLE Bundle (
  id TEXT PRIMARY KEY,
  alias TEXT NOT NULL
);

CREATE TABLE Message (
  id TEXT PRIMARY KEY, 
  bundleId TEXT NOT NULL,
  locale TEXT NOT NULL,
  declarations TEXT NOT NULL,
  selectors TEXT NOT NULL
);

CREATE TABLE Variant (
  id TEXT PRIMARY KEY, 
  messageId TEXT NOT NULL,
  match TEXT NOT NULL,
  pattern TEXT NOT NULL
);
  
CREATE INDEX idx_message_bundleId ON Message (bundleId);
CREATE INDEX idx_variant_messageId ON Variant (messageId);
		`.execute(db)

		const inlangDbContent = contentFromDatabase(sqlite)

		const sizeInMB = inlangDbContent.length / 1_048_576

		console.log({ sizeInMB })

		const lix = await openLixInMemory({ blob: await newLixFile() })

		console.log("right before insertInto files")

		// write files to lix
		await lix.db
			.insertInto("file")
			.values([
				// // TODO fix this file write which is throwing
				{
					// TODO ensure posix paths validation with lix
					path: "/db.sqlite",
					// TODO let lix generate the id
					id: uuidv4(),
					data: inlangDbContent,
				},
				{
					path: "/settings.json",
					id: uuidv4(),
					data: await new Blob([
						JSON.stringify(defaultProjectSettings, undefined, 2),
					]).arrayBuffer(),
				},
			])
			.execute()
		console.log("after insert into")
		return lix.toBlob()
	} catch (e) {
		throw new Error(`Failed to create new inlang project: ${e}`, { cause: e })
	} finally {
		sqlite.close()
		await db.destroy()
	}
}

const defaultProjectSettings = {
	$schema: "https://inlang.com/schema/project-settings",
	baseLocale: "en",
	locales: ["en", "de"],
	modules: [
		// for instant gratification, we're adding common rules
		// "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
		// "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
		// "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-without-source@latest/dist/index.js",
		// default to the message format plugin because it supports all features
		// "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@latest/dist/index.js",
		// the m function matcher should be installed by default in case Sherlock (VS Code extension) is adopted
		// "https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@latest/dist/index.js",
	],
} satisfies ProjectSettings