import type { Logger } from "~/services/logger/index.js"
import type { Repository } from "@lix-js/client"
import type { CliStep } from "../utils.js"
import type { InlangProject } from "@inlang/sdk"
import * as Ninja from "@inlang/recommend-ninja"
import { prompt } from "~/cli/utils.js"
import { telemetry } from "~/services/telemetry/implementation.js"

export const maybeAddNinja: CliStep<
	{
		repo: Repository
		logger: Logger
		project: InlangProject
	},
	unknown
> = async (ctx) => {
	if (await Ninja.shouldRecommend({ fs: ctx.repo.nodeishFs })) {
		const response = await prompt(
			"Do you want to add the 🥷 Ninja Github Action for linting translations in CI?" +
				"\n\n" +
				"https://inlang.com/m/3gk8n4n4/app-inlang-ninjaI18nAction",
			{
				type: "confirm",
				initial: true,
			}
		)

		if (response !== true) return ctx

		try {
			await Ninja.add({ fs: ctx.repo.nodeishFs })
			telemetry.capture({ event: "PARAGLIDE JS init added Ninja" })
			ctx.logger.success("Added the 🥷 Ninja Github Action for linting translations")
		} catch (error) {
			ctx.logger.error("Failed to add the 🥷 Ninja Github Action. Please open an issue")
		}
	}

	return ctx
}
