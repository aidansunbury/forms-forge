import { ShortenedText } from "@/components/ShortenedText";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { FileResponseType as FileResponseType } from "@/server/db/schema.types";
import Link from "next/link";

const getFileViewUrl = (fileId: string) => {
    return `https://drive.google.com/file/d/${fileId}/view`;
};

export const FileResponse = ({
    files,
}: { files: FileResponseType[] | null }) => {
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
                    <ShortenedText maxLength={40} text={file.fileName} />
                </Link>
            ))}
        </div>
    );
};
