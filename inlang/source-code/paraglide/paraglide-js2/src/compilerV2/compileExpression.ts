import type { Expression, FunctionAnnotation } from "@inlang/sdk"
import { isValidJSIdentifier } from "../services/valid-js-identifier/index.js"
import {
	escapeForDoubleQuoteString,
	escapeForSingleQuoteString,
} from "../services/codegen/escape.js"
import { mergeTypeRestrictions, type Compilation } from "./types.js"

export function compileExpression(lang: string, expression: Expression): Compilation<Expression> {
	if (expression.annotation) {
		const fn = expression.annotation
		const hasOptions = fn.options.length > 0

		let typeRestrictions: Record<string, string> = {}
		if (fn.name === "plural" && expression.arg.type === "variable") {
			typeRestrictions[expression.arg.name] = "number"
		}

		const args = [`"${lang}"`, compileArg(expression.arg)]
		if (hasOptions) {
			const options = compileOptions(fn.options)
			args.push(options.code)
			typeRestrictions = mergeTypeRestrictions(typeRestrictions, options.typeRestrictions)
		}

		const code = isValidJSIdentifier(fn.name)
			? `registry.${fn.name}(${args.join(", ")})`
			: `registry["${escapeForDoubleQuoteString(fn.name)}"](${args.join(", ")})`

		return { code, typeRestrictions, source: expression }
	}
	const code = compileArg(expression.arg)
	return { code, typeRestrictions: {}, source: expression }
}

function compileOptions(
	options: FunctionAnnotation["options"]
): Compilation<FunctionAnnotation["options"]> {
	const entires: string[] = options.map((option) => `${option.name}: ${compileArg(option.value)}`)
	const code = "{" + entires.join(", ") + "}"
	// TODO Type-Narrowing for options - do we support using inputs as options yet?
	return { code, typeRestrictions: {}, source: options }
}

function compileArg(arg: Expression["arg"]): string {
	switch (arg.type) {
		case "literal":
			return `"${escapeForDoubleQuoteString(arg.name)}"`
		case "variable": {
			const escaped = !isValidJSIdentifier(arg.name)
			return escaped ? `inputs['${escapeForSingleQuoteString(arg.name)}']` : `inputs.${arg.name}`
		}
	}
}
