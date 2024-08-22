import type { BundleNested } from "@inlang/sdk"

export const simplifyBundle = (bundle: BundleNested) => {
	// all patterns should become a single text pattern that is randomized
	for (const message of bundle.messages) {
		for (const variant of message.variants) {
			variant.pattern = [{ type: "text", value: createRandomString(8) }]
		}
	}

	return bundle
}

const createRandomString = (length: number) => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let result = ""
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}
