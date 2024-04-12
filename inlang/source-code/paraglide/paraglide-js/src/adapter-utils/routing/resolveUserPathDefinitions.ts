import type { MessageIndexFunction } from "~/index.js"
import type { PathDefinitionTranslations } from "./routeDefinitions.js"

/**
 * Maps canonical paths to translations for each language.
 *
 * @example
 * ```json
 * {
 *   "/": {
 *    "en": "/",
 *    "de": "/de"
 *   },
 *   "/about": {
 *     "en": "/about",
 *     "de": "/ueber-uns"
 *   },
 *   "/admin/users/[id]": {
 *     "en": "/admin/users/[id]",
 *     "de": "/admin/benutzer/[id]"
 *   }
 * }
 * ```
 */
export type UserPathTranslations<T extends string = string> = {
	[canonicalPath: `/${string}`]: Record<T, `/${string}`> | MessageIndexFunction<T>
}

/**
 * For UX purpouses we let users pass messages as pathnames.
 *
 * Fully resolves all path translations.
 * If a path translation is a message-function, it will be evaluated for each language.
 *
 * Does NOT perform any validation on if the user-provided path translation configuration is valid.
 *
 * @param userTranslations The user-provided path translation configuration.
 * @param availableLanguageTags The available language tags.
 * @returns The resolved path translations.
 */
export const resolvePathTranslations = <T extends string>(
	userTranslations: UserPathTranslations<T>,
	availableLanguageTags: readonly T[]
): PathDefinitionTranslations<T> =>
	Object.fromEntries(
		Object.entries(userTranslations).map(([path, translation]) => [
			path,
			typeof translation === "object"
				? translation
				: fromMessage(translation, availableLanguageTags),
		])
	)

function fromMessage<T extends string>(
	message: MessageIndexFunction<T>,
	availableLanguageTags: readonly T[]
): Record<T, `/${string}`> {
	const entries = availableLanguageTags.map(
		(languageTag) => [languageTag, message({}, { languageTag })] as const
	)
	return Object.fromEntries(entries) as Record<T, `/${string}`>
}
