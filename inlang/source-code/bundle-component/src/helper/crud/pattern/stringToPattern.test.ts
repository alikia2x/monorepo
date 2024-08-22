import { describe, expect, it } from "vitest"
import stringToPattern from "./stringToPattern.js"
import type { Pattern } from "@inlang/sdk"

describe("stringToPattern", () => {
	it("Should transform string to pattern", () => {
		const text = "Hello, {{name}}!"

		const pattern = stringToPattern({ text })

		const correspondingPattern: Pattern = [
			{
				type: "text",
				value: "Hello, ",
			},
			{
				type: "expression",
				arg: {
					type: "variable",
					name: "name",
				},
			},
			{
				type: "text",
				value: "!",
			},
		]
		expect(pattern).toStrictEqual(correspondingPattern)
	})
})
