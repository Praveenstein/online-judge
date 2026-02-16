import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { ExcalidrawBlock } from "../blocks/ExcalidrawBlock";
import { CodeExecutionBlock } from "../blocks/CodeExecutionBlock";
import { SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { CodeOutputProvider, useCodeOutput } from "../context/CodeOutputContext";
import { Stack, Text, Box, Loader, ActionIcon, Tooltip } from "@mantine/core";

const OutputSidebar = () => {
	const { output, loading, isOpen, toggleSidebar } = useCodeOutput();

	return (
		<aside className={`right-sidebar ${!isOpen ? 'right-sidebar-collapsed' : ''}`}>
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-default)]">
					<div>
						<h2 className="text-lg font-bold text-[var(--text-primary)]">Execution Results</h2>
						<p className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Console Output</p>
					</div>
					<ActionIcon
						variant="subtle"
						color="gray"
						size="lg"
						onClick={toggleSidebar}
						style={{ borderRadius: '8px' }}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</ActionIcon>
				</div>

				<div className="flex-1 overflow-y-auto pr-2">
					{loading ? (
						<Stack align="center" justify="center" h="100%" gap="lg">
							<Loader color="blue" size="md" variant="dots" />
							<Text size="sm" fw={500} c="dimmed">Executing block...</Text>
						</Stack>
					) : output ? (
						<div className="space-y-6">
							{output.stdout && (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-green-500"></div>
										<Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Standard Output</Text>
									</div>
									<pre className="output-pre text-green-400">
										{output.stdout}
									</pre>
								</div>
							)}
							{output.stderr && (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-red-500"></div>
										<Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">Standard Error</Text>
									</div>
									<pre className="output-pre text-red-400 border-red-900/30">
										{output.stderr}
									</pre>
								</div>
							)}
							{!output.stdout && !output.stderr && (
								<div className="flex flex-col items-center justify-center py-20 opacity-40">
									<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="8" x2="12" y2="12"></line>
										<line x1="12" y1="16" x2="12.01" y2="16"></line>
									</svg>
									<Text size="sm" italic>No output content</Text>
								</div>
							)}
							<div className="mt-12 pt-6 border-t border-[var(--border-default)] flex items-center justify-between">
								<Text size="xs" c="dimmed" fw={500}>Exit Status</Text>
								<div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${output.exit_code === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
									{output.exit_code === 0 ? 'Success' : `Error (${output.exit_code})`}
								</div>
							</div>
						</div>
					) : (
						<Stack align="center" justify="center" h="100%" p="xl" className="text-center opacity-30">
							<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-6">
								<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
								<line x1="8" y1="21" x2="16" y2="21"></line>
								<line x1="12" y1="17" x2="12" y2="21"></line>
							</svg>
							<Text size="sm" fw={500}>Ready for execution</Text>
							<Text size="xs">Click "Run" on any code block to view results here</Text>
						</Stack>
					)}
				</div>
			</div>
		</aside>
	);
};

export default function Notes() {
	// Create a custom schema with the Excalidraw block
	const schema = BlockNoteSchema.create({
		blockSpecs: {
			...defaultBlockSpecs,
			excalidraw: ExcalidrawBlock(),
			codeExecution: CodeExecutionBlock(),
		},
	});

	// Initialize the editor instance
	const editor = useCreateBlockNote({
		schema,
	});

	// Custom slash menu item
	const getCustomSlashMenuItems = (editor) => [
		...getDefaultReactSlashMenuItems(editor).filter(item => item.title !== "Code Block"),
		{
			title: "Code (Executable)",
			onItemClick: () => {
				editor.insertBlocks(
					[
						{
							type: "codeExecution",
						},
					],
					editor.getTextCursorPosition().block,
					"after"
				);
			},
			aliases: ["code", "programming", "js", "python", "cpp"],
			group: "Programming",
			icon: <span>💻</span>,
			subtext: "Insert an executable code block",
		},
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
		<CodeOutputProvider>
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
			<OutputSidebar />
		</CodeOutputProvider>
	);
}
