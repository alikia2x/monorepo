import type { BundleNested } from "@inlang/sdk"

export const bundleWithoutSelectors: BundleNested = {
	id: "message-bundle-id",
	messages: [
		{
			bundleId: "message-bundle-id",
			id: "message-id-en",
			locale: "en",
			selectors: [],
			declarations: [],
			variants: [
				{
					messageId: "message-id-en",
					id: "variant-id-en-*",
					match: {},
					pattern: [{ type: "text", value: "{count} new messages" }],
				},
			],
		},
		{
			bundleId: "message-bundle-id",
			id: "message-id-de",
			locale: "de",
			selectors: [],
			declarations: [],
			variants: [
				{
					messageId: "message-id-de",
					id: "variant-id-de-*",
					match: {},
					pattern: [{ type: "text", value: "{count} neue Nachrichten" }],
				},
			],
		},
	],
	alias: {},
	// 	default: "frontend_button_text",
	// 	ios: "frontendButtonText",
	// },
}
