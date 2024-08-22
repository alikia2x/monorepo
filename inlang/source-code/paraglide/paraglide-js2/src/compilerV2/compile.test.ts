import { expect, test, describe, vi, beforeEach } from "vitest"
import { createProject as typescriptProject, ts } from "@ts-morph/bootstrap"
import { BundleNested, ProjectSettings } from "@inlang/sdk2"
import { compile } from "./compile.js"
import { rollup } from "rollup"
import virtual from "@rollup/plugin-virtual"
import terser from "@rollup/plugin-terser"

const mockBundles: BundleNested[] = [
	{
		id: "happy_elephant_bundle",
		alias: {
			inlang: "missingInGerman",
		},
		messages: [
			{
				id: "happy_elephant_message_en",
				bundleId: "happy_elephant_bundle",
				locale: "en",
				declarations: [],
				selectors: [],
				variants: [
					{
						id: "happy_elephant_message_en_variant_one",
						match: [],
						messageId: "happy_elephant_message_en",
						pattern: [{ type: "text", value: "A simple message." }],
					},
				],
			},
		],
	},
	{
		id: "sad_penguin_bundle",
		alias: {
			inlang: "onlyText",
		},
		messages: [
			{
				id: "sad_penguin_message_en",
				bundleId: "sad_penguin_bundle",
				locale: "en",
				selectors: [],
				declarations: [],
				variants: [
					{
						id: "sad_penguin_message_en_variant_one",
						messageId: "sad_penguin_message_en",
						match: [],
						pattern: [{ type: "text", value: "A simple message." }],
					},
				],
			},
			{
				id: "sad_penguin_message_en_us",
				bundleId: "sad_penguin_bundle",
				locale: "en-US",
				selectors: [],
				declarations: [],
				variants: [
					{
						id: "sad_penguin_message_en_us_variant_one",
						messageId: "sad_penguin_message_en_us",
						match: [],
						pattern: [
							{ type: "text", value: "FUCKTARD. I am from New York. This is a simple message!" },
						],
					},
				],
			},
			{
				id: "sad_penguin_message_de",
				bundleId: "sad_penguin_bundle",
				locale: "de",
				selectors: [],
				declarations: [],
				variants: [
					{
						id: "sad_penguin_message_de_variant_one",
						messageId: "sad_penguin_message_de",
						match: [],
						pattern: [{ type: "text", value: "Eine einfache Nachricht." }],
					},
				],
			},
		],
	},
	{
		id: "depressed_dog",
		alias: {
			inlang: "oneParam",
		},
		messages: [
			{
				id: "depressed_dog_en",
				bundleId: "depressed_dog",
				locale: "en",
				selectors: [],
				declarations: [
					{
						type: "input",
						name: "name",
						value: { type: "expression", arg: { type: "variable", name: "name" } },
					},
				],
				variants: [
					{
						id: "depressed_dog_en_variant_one",
						messageId: "depressed_dog_en",
						match: [],
						pattern: [
							{ type: "text", value: "Good morning " },
							{ type: "expression", arg: { type: "variable", name: "name" } },
							{ type: "text", value: "!" },
						],
					},
				],
			},
			{
				id: "depressed_dog_de",
				bundleId: "depressed_dog",
				locale: "de",
				selectors: [],
				declarations: [
					{
						type: "input",
						name: "name",
						value: { type: "expression", arg: { type: "variable", name: "name" } },
					},
				],
				variants: [
					{
						id: "depressed_dog_de_variant_one",
						messageId: "depressed_dog_de",
						match: [],
						pattern: [
							{ type: "text", value: "Guten Morgen " },
							{ type: "expression", arg: { type: "variable", name: "name" } },
							{ type: "text", value: "!" },
						],
					},
				],
			},
		],
	},
	{
		id: "insane_cats",
		alias: {
			input: "multipleParams",
		},
		messages: [
			{
				id: "insane_cats_en",
				bundleId: "insane_cats",
				locale: "en",
				declarations: [
					{
						type: "input",
						name: "name",
						value: { type: "expression", arg: { type: "variable", name: "name" } },
					},
					{
						type: "input",
						name: "name",
						value: { type: "expression", arg: { type: "variable", name: "count" } },
					},
				],
				selectors: [],
				variants: [
					{
						id: "insane_cats_en_variant_one",
						messageId: "insane_cats_en",
						match: [],
						pattern: [
							{ type: "text", value: "Hello " },
							{ type: "expression", arg: { type: "variable", name: "name" } },
							{ type: "text", value: "! You have " },
							{ type: "expression", arg: { type: "variable", name: "count" } },
							{ type: "text", value: " messages." },
						],
					},
				],
			},
			{
				id: "insane_cats_de",
				bundleId: "insane_cats",
				locale: "de",
				declarations: [
					{
						type: "input",
						name: "name",
						value: { type: "expression", arg: { type: "variable", name: "name" } },
					},
					{
						type: "input",
						name: "name",
						value: { type: "expression", arg: { type: "variable", name: "count" } },
					},
				],
				selectors: [],
				variants: [
					{
						id: "insane_cats_de_variant_one",
						messageId: "insane_cats_de",
						match: [],
						pattern: [
							{ type: "text", value: "Hallo " },
							{ type: "expression", arg: { type: "variable", name: "name" } },
							{ type: "text", value: "! Du hast " },
							{ type: "expression", arg: { type: "variable", name: "count" } },
							{ type: "text", value: " Nachrichten." },
						],
					},
				],
			},
		],
	},
]

const mockSettings: ProjectSettings = {
	baseLocale: "en",
	locales: ["en", "de", "en-US"],
}

const output = await compile({
	bundles: mockBundles,
	settings: mockSettings,
	projectId: undefined,
})

describe("paraglide", () => {
	beforeEach(() => {
		// reset the imports to make sure that the runtime is reloaded
		vi.resetModules()
	})
	describe("output-formalities", () => {
		// the compiled should be ignored to avoid merge conflicts
		test("the files should include a gitignore file", async () => {
			expect(output).toHaveProperty(".gitignore")
			expect(output[".gitignore"]).toContain("*")
		})
		// ignore all formatting stuff
		test("the files should include a prettierignore file", async () => {
			expect(output).toHaveProperty(".prettierignore")
			expect(output[".prettierignore"]).toContain("*")
		})

		test("the files should include files for each language, even if there are no messages", async () => {
			const output = await compile({
				bundles: [],
				settings: { locales: ["en", "de"], baseLocale: "en" },
				projectId: undefined,
			})
			expect(output["messages/en.js"]).toBeDefined()
			expect(output["messages/de.js"]).toBeDefined()
		})
	})

	describe("tree-shaking", () => {
		// removing comments makes the output more predictable and testable
		const removeComments = () =>
			// @ts-expect-error - rollup types are not up to date
			terser({
				format: {
					comments: false,
				},
				compress: false,
				mangle: false,
			})

		test("should tree-shake unused messages", async () => {
			const bundle = await rollup({
				input: "app.js",
				plugins: [
					removeComments(),
					// @ts-expect-error - rollup types are not up to date
					virtual({
						...Object.fromEntries(
							Object.entries(output).map(([fileName, code]) => ["paraglide/" + fileName, code])
						),
						"app.js": `
					import * as m from "./paraglide/messages.js"

					console.log(m.sad_penguin_bundle())
					`,
					}),
				],
			})
			const compiled = await bundle.generate({ format: "esm" })
			const log = vi.spyOn(console, "log").mockImplementation(() => {})
			// all required code for the message to be rendered is included like sourceLanguageTag.
			// but, all other messages except of 'onlyText' are tree-shaken away.
			for (const { id } of mockBundles) {
				if (id === "sad_penguin_bundle") {
					expect(compiled.output[0].code).toContain(id)
				} else {
					expect(compiled.output[0].code).not.toContain(id)
				}
			}
			eval(compiled.output[0].code)
			expect(log).toHaveBeenCalledWith("A simple message.")
		})

		test("should not treeshake messages that are used", async () => {
			const bundle = await rollup({
				input: "app.js",
				plugins: [
					removeComments(),
					// @ts-expect-error - rollup types are not up to date
					virtual({
						...Object.fromEntries(
							Object.entries(output).map(([fileName, code]) => ["paraglide/" + fileName, code])
						),
						"app.js": `

					import * as m from "./paraglide/messages.js"

					console.log(
						m.sad_penguin_bundle(),
						m.depressed_dog({ name: "Samuel" }),
						m.insane_cats({ name: "Samuel", count: 5 })
					)
					`,
					}),
				],
			})
			const result = await bundle.generate({ format: "esm" })
			const log = vi.spyOn(console, "log").mockImplementation(() => {})
			for (const id of mockBundles.map((m) => m.id)) {
				if (["sad_penguin_bundle", "depressed_dog", "insane_cats"].includes(id)) {
					expect(result.output[0].code).toContain(id)
				} else {
					expect(result.output[0].code).not.toContain(id)
				}
			}
			eval(result.output[0].code)
			expect(log).toHaveBeenCalledWith(
				"A simple message.",
				"Good morning Samuel!",
				"Hello Samuel! You have 5 messages."
			)
		})
	})

	describe("e2e", async () => {
		// The compiled output needs to be bundled into one file to be dynamically imported.
		const bundle = await rollup({
			input: "test.js",
			plugins: [
				// @ts-expect-error - rollup types are not up to date
				virtual({
					...Object.fromEntries(
						Object.entries(output).map(([fileName, code]) => ["paraglide/" + fileName, code])
					),
					"test.js": `
          export * as m from "./paraglide/messages.js"
          export * as runtime from "./paraglide/runtime.js"
		  export * as en from "./paraglide/messages/en.js"
        `,
				}),
			],
		})
		// dynamically import the compiled output
		const compiledBundle = await bundle.generate({ format: "esm" })

		// test is a direct result of a bug
		test("availableLanguageTags should include language tags with a hyphen", async () => {
			const { runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)
			expect(runtime.availableLanguageTags).toContain("en-US")
		})

		test("it should be possible to directly import a message function via a resource file", async () => {
			const { en } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)
			expect(en).toBeDefined()
			expect(en.onlyText()).toBe("A simple message.")
		})

		test("should set the source language tag as default language tag", async () => {
			const { runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)
			expect(runtime.languageTag()).toBe(runtime.sourceLanguageTag)
		})

		test("should return the correct message for the set language tag", async () => {
			const { m, runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)

			runtime.setLanguageTag("en")

			expect(m.onlyText()).toBe("A simple message.")
			expect(m.oneParam({ name: "Samuel" })).toBe("Good morning Samuel!")
			expect(m.multipleParams({ name: "Samuel", count: 5 })).toBe(
				"Hello Samuel! You have 5 messages."
			)

			runtime.setLanguageTag("de")

			expect(m.onlyText()).toBe("Eine einfache Nachricht.")
			expect(m.oneParam({ name: "Samuel" })).toBe("Guten Morgen Samuel!")
			expect(m.multipleParams({ name: "Samuel", count: 5 })).toBe(
				"Hallo Samuel! Du hast 5 Nachrichten."
			)
		})

		test("setting the languageTag as a getter function should be possible", async () => {
			const { m, runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)

			runtime.setLanguageTag(() => "en")

			expect(m.onlyText()).toBe("A simple message.")

			runtime.setLanguageTag(() => "de")

			expect(m.onlyText()).toBe("Eine einfache Nachricht.")
		})

		test("defining onSetLanguageTag should be possible and should be called when the language tag changes", async () => {
			const { runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)

			const mockOnSetLanguageTag = vi.fn().mockImplementation(() => {})
			runtime.onSetLanguageTag((tag: any) => {
				mockOnSetLanguageTag(tag)
			})

			runtime.setLanguageTag("de")
			expect(mockOnSetLanguageTag).toHaveBeenLastCalledWith("de")

			runtime.setLanguageTag("en")
			expect(mockOnSetLanguageTag).toHaveBeenLastCalledWith("en")

			expect(mockOnSetLanguageTag).toHaveBeenCalledTimes(2)
		})

		test("Calling onSetLanguageTag() multiple times should override the previous callback", async () => {
			const cb1 = vi.fn().mockImplementation(() => {})
			const cb2 = vi.fn().mockImplementation(() => {})

			const { runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code + "//" + Math.random(),
					"utf8"
				).toString("base64")}`
			)

			runtime.onSetLanguageTag(cb1)
			runtime.setLanguageTag("en")

			expect(cb1).toHaveBeenCalledTimes(1)

			runtime.onSetLanguageTag(cb2)
			runtime.setLanguageTag("de")

			expect(cb2).toHaveBeenCalledTimes(1)
			expect(cb1).toHaveBeenCalledTimes(1)
		})

		test("should return the correct message if a languageTag is set in the message options", async () => {
			const { m, runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)

			// set the language tag to de to make sure that the message options override the runtime language tag
			runtime.setLanguageTag("de")
			expect(m.onlyText()).toBe("Eine einfache Nachricht.")
			expect(m.onlyText(undefined, { languageTag: "en" })).toBe("A simple message.")
			expect(m.multipleParams({ name: "Samuel", count: 5 }, { languageTag: "en" })).toBe(
				"Hello Samuel! You have 5 messages."
			)

			runtime.setLanguageTag("en")
			expect(m.onlyText({}, { languageTag: "de" })).toBe("Eine einfache Nachricht.")
			expect(m.oneParam({ name: "Samuel" }, { languageTag: "de" })).toBe("Guten Morgen Samuel!")
			expect(m.multipleParams({ name: "Samuel", count: 5 }, { languageTag: "de" })).toBe(
				"Hallo Samuel! Du hast 5 Nachrichten."
			)
		})

		test("runtime.isAvailableLanguageTag should only return `true` if a language tag is passed to it", async () => {
			const { runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)

			for (const tag of runtime.availableLanguageTags) {
				expect(runtime.isAvailableLanguageTag(tag)).toBe(true)
			}

			expect(runtime.isAvailableLanguageTag("")).toBe(false)
			expect(runtime.isAvailableLanguageTag("pl")).toBe(false)
			expect(runtime.isAvailableLanguageTag("--")).toBe(false)
		})

		test("falls back to messages according to BCP 47 lookup order", async () => {
			const { m, runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)

			runtime.setLanguageTag("de")
			expect(m.missingInGerman()).toBe("A simple message.")
			runtime.setLanguageTag("en-US")
			expect(m.missingInGerman()).toBe("A simple message.")
		})

		test("throws an error if languageTag() returns a non-languageTag value", async () => {
			const { runtime } = await import(
				`data:application/javascript;base64,${Buffer.from(
					compiledBundle.output[0].code,
					"utf8"
				).toString("base64")}`
			)

			expect(() => {
				runtime.setLanguageTag("dsklfgj")
				runtime.languageTag()
			}).toThrow()
		})
	})

	test("ts", async () => {
		const project = await typescriptProject({
			useInMemoryFileSystem: true,
			compilerOptions: {
				outDir: "dist",
				declaration: true,
				allowJs: true,
				checkJs: true,
				module: ts.ModuleKind.Node16,
				strict: true,
			},
		})

		for (const [fileName, code] of Object.entries(output)) {
			if (fileName.endsWith(".js")) {
				project.createSourceFile(fileName, code)
			}
		}
		project.createSourceFile(
			"test.ts",
			`
    import * as m from "./messages.js"
    import * as runtime from "./runtime.js"

    // --------- RUNTIME ---------

    // sourceLanguageTag should have a narrow type, not a generic string

    runtime.sourceLanguageTag satisfies "en"

    // availableLanguageTags should have a narrow type, not a generic string
    runtime.availableLanguageTags satisfies Readonly<Array<"de" | "en" | "en-US">>

    // setLanguageTag() should fail if the given language tag is not included in availableLanguageTags
    // @ts-expect-error - 
    runtime.setLanguageTag("fr")

    // setLanguageTag() should not fail if the given language tag is included in availableLanguageTags
    runtime.setLanguageTag("de")

    // languageTag should return type should be a union of language tags, not a generic string
    runtime.languageTag() satisfies "de" | "en" | "en-US"

	// setting the language tag as a getter function should be possible
	runtime.setLanguageTag(() => "en")

	// isAvailableLanguageTag should narrow the type of it's argument
	const thing = 5;
	if(runtime.isAvailableLanguageTag(thing)) {
		const a : "de" | "en" | "en-US" = thing
	} else {
		// @ts-expect-error - thing is not a language tag
		const a : "de" | "en" | "en-US" = thing
	}

    // --------- MESSAGES ---------

    // the return value of a message should be a string
    m.multipleParams({ name: "John", count: 5 }) satisfies string
      
    // @ts-expect-error - missing all params
    m.multipleParams()
      
    // @ts-expect-error - one param missing
    m.multipleParams({ name: "John" })

    // a message without params shouldn't require params
    m.onlyText() satisfies string


	// --------- MESSAGE OPTIONS ---------
	// the languageTag option should be optional
	m.onlyText({}, {}) satisfies string

	// the languageTag option should be allowed
	m.onlyText({}, { languageTag: "en" }) satisfies string

	// the languageTag option must be a valid language tag
	// @ts-expect-error - invalid language tag
	m.onlyText({}, { languageTag: "---" })
  `
		)

		const program = project.createProgram()
		const diagnostics = ts.getPreEmitDiagnostics(program)
		for (const diagnostic of diagnostics) {
			console.error(diagnostic.messageText, diagnostic.file?.fileName)
		}
		expect(diagnostics.length).toEqual(0)
	})
})
