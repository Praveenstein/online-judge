import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { ExcalidrawBlock } from "../blocks/ExcalidrawBlock";
import { SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";

export default function Notes() {
	// Create a custom schema with the Excalidraw block
	const schema = BlockNoteSchema.create({
		blockSpecs: {
			...defaultBlockSpecs,
			excalidraw: ExcalidrawBlock(),
		},
	});

	// Initialize the editor instance
	const editor = useCreateBlockNote({
		schema,
	});

	// Custom slash menu item
	const getCustomSlashMenuItems = (editor) => [
		...getDefaultReactSlashMenuItems(editor),
		{
			title: "Excalidraw",
			onItemClick: () => {
				editor.insertBlocks(
					[
						{
							type: "excalidraw",
						},
					],
					editor.getTextCursorPosition().block,
					"after"
				);
			},
			aliases: ["sketch", "drawing", "diagram"],
			group: "Media",
			icon: <span>🎨</span>,
			subtext: "Insert an Excalidraw diagram",
		},
	];


	return (
		<div className="flex flex-col min-h-full">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">My Notes</h1>
			</div>
			<div className="flex-1 -mx-4">
				<BlockNoteView editor={editor} theme="light" slashMenu={false}>
					<SuggestionMenuController
						triggerCharacter={"/"}
						getItems={async (query) =>
							// Simple filter for the slash menu items
							getCustomSlashMenuItems(editor).filter((item) =>
								item.title.toLowerCase().includes(query.toLowerCase()) ||
								(item.aliases && item.aliases.some(alias => alias.toLowerCase().includes(query.toLowerCase())))
							)
						}
					/>
				</BlockNoteView>
			</div>
		</div>
	);
}
