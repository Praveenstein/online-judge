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
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">My Notes</h1>
			<div className="border rounded-lg p-4 shadow-sm bg-gray-50 min-h-[500px]">
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
