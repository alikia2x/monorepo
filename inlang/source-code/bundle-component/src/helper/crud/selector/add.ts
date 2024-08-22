import { createVariant, type Expression, type MessageNested } from "@inlang/sdk"

/**
 * Adds a selector to a message.
 * The function mutates the message.
 * @param props.message The message to add the selector to.
 * @param props.selector The selector to add.
 *
 * @example
 * addSelector({ message, selector: { type: "expression", arg: { type: "variable", name: "mySelector" } } })
 */

const addSelector = (props: { message: MessageNested; selector: Expression }) => {
	props.message.selectors.push(props.selector)
	if (props.message.variants.length !== 0) {
		for (const variant of props.message.variants) {
			variant.match[props.selector.arg.name] = "*"
		}
	} else {
		props.message.variants.push(
			createVariant({
				messageId: props.message.id,
				match: { [props.selector.arg.name]: "*" },
				text: "",
			})
		)
	}
}

export default addSelector
