import { Badge, badgeVariants } from "@/components/ui/badge";
import Link from "next/link";
import type { FileResponse } from "@/server/db/schema";

const getFileViewUrl = (fileId: string) => {
	return `https://drive.google.com/file/d/${fileId}/view`;
};

export const FileComponent = ({ files }: { files: FileResponse[] | null }) => {
	if (!files) {
		return null;
	}
	return (
		<div>
			{files.map((file) => (
				<Link
					className={badgeVariants({ variant: "outline" })}
					href={getFileViewUrl(file.fileId)}
					key={file.fileId}
					target="_blank"
				>
					{file.fileName}
				</Link>
			))}
		</div>
	);
};
