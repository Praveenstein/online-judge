import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

export default function Notes() {
	// Initialize the editor instance
	const editor = useCreateBlockNote();

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">My Notes</h1>
			<div className="border rounded-lg p-4 shadow-sm bg-gray-50">
				<BlockNoteView editor={editor} theme="light" />
			</div>
		</div>
	);
}
