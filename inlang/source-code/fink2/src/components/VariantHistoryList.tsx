import { useAtom } from "jotai";
import { projectAtom } from "../state.ts";
import { useEffect, useState } from "react";
import { Pattern, Variant } from "@inlang/sdk";
import { SlButton } from "@shoelace-style/shoelace/dist/react";
import queryHelper from "../helper/queryHelper.ts";
import timeAgo from "../helper/timeAgo.ts";

const VariantHistoryList = (props: {
	variantId: string;
	setHistoryModalOpen: (value: boolean) => void;
	setSelectedVariantId: (value: string | null) => void;
}) => {
	const [project] = useAtom(projectAtom);
	const [changes, setChanges] = useState<any[]>([]);
	const [loading, setLoading] = useState<string | undefined>(undefined);

	const getChanges = async () => {
		if (!project) return;
		const result = await project.lix.db
			.selectFrom("change")
			.selectAll()
			.where("change.type", "=", "variant")
			.where((eb) => eb.ref("value", "->>").key("id"), "=", props.variantId)
			.innerJoin("commit", "commit.id", "change.commit_id")
			// TODO remove after sequence concept on lix
			.where(
				"change.id",
				"not in",
				project.lix.db
					.selectFrom("conflict")
					.select("conflict.conflicting_change_id")
			)
			.orderBy("commit.user_id desc")
			.orderBy("commit.created desc")
			.execute();

		setChanges(result);
	};

	const handleRollback = async (
		revertedVariant: Variant,
		zoned_date_time: string
	) => {
		if (project) {
			setLoading(zoned_date_time);
			await queryHelper.variant.update(project.db, revertedVariant).execute();

			setTimeout(() => {
				setLoading(undefined);
				props.setHistoryModalOpen(false);
				props.setSelectedVariantId(null);
			}, 1000);
		}
	};

	useEffect(() => {
		if (!project) return;
		getChanges();
		const interval = setInterval(async () => {
			await getChanges();
		}, 1000);
		return () => clearInterval(interval);
	}, [project]);

	return (
		<div className="divide-y divide-zinc-200 -mt-6 -mb-2 max-h-[440px] overflow-y-scroll">
			{changes.map((change) => {
				return (
					<div key={change.id} className="py-6 px-1">
						<div className="flex items-center justify-between">
							<h3 className="text-[16px] text-zinc-500">
								<span className="font-medium text-zinc-950">
									{change.user_id}
								</span>{" "}
								changed variant
							</h3>
							<p className="text-[16px] text-zinc-700">
								{timeAgo(change.created)}
							</p>
						</div>
						<div className="flex gap-2 mt-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20px"
								height="20px"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M12 17q-1.825 0-3.187-1.137T7.1 13H2v-2h5.1q.35-1.725 1.713-2.863T12 7t3.188 1.138T16.9 11H22v2h-5.1q-.35 1.725-1.712 2.863T12 17m0-2q1.25 0 2.125-.875T15 12t-.875-2.125T12 9t-2.125.875T9 12t.875 2.125T12 15"
								/>
							</svg>
							<p className="text-zinc-500 flex-1 py-[2px]">
								{change.description}
							</p>
						</div>
						<div className="flex gap-2">
							<div className="flex-1 rounded border border-zinc-200 bg-zinc-50 px-3 py-[10px] text-[13px]! font-medium mt-4 text-zinc-700">
								{patternToString({ pattern: change.value.pattern })}
							</div>
							<SlButton
								variant="default"
								size="medium"
								className="mt-4 ml-auto"
								loading={loading === change.created}
								onClick={() =>
									handleRollback(change.value, change.created)
								}
							>
								Rollback
							</SlButton>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default VariantHistoryList;

const patternToString = (props: { pattern: Pattern }): string => {
	if (!props.pattern) {
		return "";
	}
	return props.pattern
		.map((p) => {
			if ("value" in p) {
				return p.value;
				// @ts-ignore
			} else if (p.type === "expression" && p.arg.type === "variable") {
				// @ts-ignore
				return `{{${p.arg.name}}}`;
			}
			return "";
		})
		.join("");
};
