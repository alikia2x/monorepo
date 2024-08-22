import { useAtom } from "jotai";
import { projectAtom } from "../state.ts";
import { useEffect, useState } from "react";
import { InlangProject } from "@inlang/sdk";
import timeAgo from "../helper/timeAgo.ts";

const VariantHistory = (props: { variantId: string }) => {
	const [project] = useAtom(projectAtom);
	const [latestCommit, setLatestCommit] = useState<any>(undefined);

	useEffect(() => {
		if (!project) return;
		queryLatestCommit(project, props.variantId).then((result) =>
			setLatestCommit(result)
		);
		const interval = setInterval(async () => {
			const result = await queryLatestCommit(project, props.variantId);
			setLatestCommit(result);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		console.log(latestCommit);
	}, [latestCommit]);
	return (
		<div className="flex items-center text-zinc-400 text-sm!">
			{latestCommit?.user_id && (
				<p>
					by {latestCommit?.user_id} | {timeAgo(latestCommit?.created)}
				</p>
			)}
		</div>
	);
};

export default VariantHistory;

const queryLatestCommit = async (project: InlangProject, variantId: string) => {
	const result = await project.lix.db
		.selectFrom("change")
		.selectAll()
		.where("change.type", "=", "variant")
		.where("change.commit_id", "!=", "null")
		.where((eb) => eb.ref("value", "->>").key("id"), "=", variantId)
		.innerJoin("commit", "commit.id", "change.commit_id")
		.orderBy("commit.user_id desc")
		.orderBy("commit.created desc")
		.executeTakeFirst();

	return result;
};
