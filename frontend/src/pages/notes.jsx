import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { ExcalidrawBlock } from "../blocks/ExcalidrawBlock";
import { CodeExecutionBlock } from "../blocks/CodeExecutionBlock";
import { SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { CodeOutputProvider, useCodeOutput } from "../context/CodeOutputContext";
import {
	Stack, Text, Box, Loader, ActionIcon, Tooltip,
	Divider, NavLink, ScrollArea, Button, Group,
	Title, Paper, Container
} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

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
	const [notes, setNotes] = useState([]);
	const [activeNote, setActiveNote] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
	const navigate = useNavigate();
	const location = useLocation();

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

	// Fetch notes list
	const fetchNotes = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");
			const response = await axios.get(`${API_BASE}/api/notes`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setNotes(response.data);

			// Check if we should auto-open a note from navigation state
			const selectedId = location.state?.selectedNoteId;
			if (selectedId) {
				const noteToOpen = response.data.find(n => n.id === selectedId);
				if (noteToOpen) {
					setActiveNote(noteToOpen);
					if (noteToOpen.content) {
						editor.replaceBlocks(editor.document, noteToOpen.content);
					}
					// Clear navigation state so back button works correctly
					navigate(location.pathname, { replace: true, state: {} });
				}
			}
		} catch (error) {
			console.error("Failed to fetch notes:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchNotes();
	}, []);

	// Handle note selection
	const handleSelectNote = async (note) => {
		if (activeNote?.id === note.id) return;
		setActiveNote(note);
		if (note.content) {
			editor.replaceBlocks(editor.document, note.content);
		} else {
			editor.replaceBlocks(editor.document, [{ type: "paragraph" }]);
		}
	};

	// Create new note
	const handleCreateNote = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await axios.post(`${API_BASE}/api/notes`, {
				title: "Untitled Note",
				content: [{ type: "paragraph" }]
			}, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setNotes([response.data, ...notes]);
			setActiveNote(response.data);
			editor.replaceBlocks(editor.document, response.data.content);
		} catch (error) {
			console.error("Failed to create note:", error);
		}
	};

	// Save note content
	const saveNote = async (content) => {
		if (!activeNote) return;
		try {
			setSaving(true);
			const token = localStorage.getItem("token");
			const response = await axios.put(`${API_BASE}/api/notes/${activeNote.id}`, {
				content: content
			}, {
				headers: { Authorization: `Bearer ${token}` }
			});
			// Sync the updated note back to the notes list
			setNotes(prev => prev.map(n => n.id === activeNote.id ? response.data : n));
		} catch (error) {
			console.error("Failed to save note:", error);
		} finally {
			setSaving(false);
		}
	};

	// Auto-save logic
	const handleEditorChange = () => {
		if (!activeNote) return;
		if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		saveTimeoutRef.current = setTimeout(() => {
			saveNote(editor.document);
		}, 1000);
	};

	const handleBack = () => {
		setActiveNote(null);
		fetchNotes(); // Refresh list to ensure latest order and titles
	};

	// Custom slash menu item
	const getCustomSlashMenuItems = (editor) => [
		...getDefaultReactSlashMenuItems(editor).filter(item => item.title !== "Code Block"),
		{
			title: "Code (Executable)",
			onItemClick: () => {
				editor.insertBlocks(
					[{ type: "codeExecution" }],
					editor.getTextCursorPosition().block,
					"after"
				);
			},
			aliases: ["code", "programming", "js", "python", "cpp"],
			group: "Programming",
			icon: <ActionIcon variant="subtle" size="sm">💻</ActionIcon>,
			subtext: "Insert an executable code block",
		},
		{
			title: "Excalidraw",
			onItemClick: () => {
				editor.insertBlocks(
					[{ type: "excalidraw" }],
					editor.getTextCursorPosition().block,
					"after"
				);
			},
			aliases: ["sketch", "drawing", "diagram"],
			group: "Media",
			icon: <ActionIcon variant="subtle" size="sm">🎨</ActionIcon>,
			subtext: "Insert an Excalidraw diagram",
		},
	];

	return (
		<CodeOutputProvider>
			<div className="flex min-h-full -mx-4 bg-[var(--bg-secondary)]">
				<main className="flex-1 flex flex-col">
					{!activeNote ? (
						/* List View */
						<Container fluid className="py-8 w-full px-8">
							<Stack gap="xl">
								<Group justify="flex-end">
									<Button
										leftSection={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
										onClick={handleCreateNote}
										variant="filled"
										color="blue"
										size="md"
										radius="md"
									>
										New Note
									</Button>
								</Group>

								<Divider />

								{loading ? (
									<Stack align="center" py="xl">
										<Loader size="lg" variant="dots" />
										<Text size="sm" c="dimmed">Loading your notes...</Text>
									</Stack>
								) : notes.length === 0 ? (
									<Paper p="xl" radius="lg" withBorder className="bg-white text-center py-20 opacity-60">
										<Box mb="md">
											<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
										</Box>
										<Title order={3}>No notes found</Title>
										<Text size="sm" c="dimmed" mx="auto" maw={400} mt="xs">
											You haven't created any notes yet. Start capturing your ideas today!
										</Text>
										<Button variant="light" mt="xl" onClick={handleCreateNote}>Create your first note</Button>
									</Paper>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
										{notes.map(note => (
											<Paper
												key={note.id}
												p="xl"
												radius="lg"
												withBorder
												className="bg-white transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer group"
												onClick={() => handleSelectNote(note)}
											>
												<Stack justify="space-between" h="100%">
													<div>
														<Group justify="space-between" wrap="nowrap" mb="xs">
															<Title order={4} className="truncate group-hover:text-blue-600 transition-colors" flex={1}>{note.title || "Untitled"}</Title>
															<ActionIcon
																variant="subtle"
																color="red"
																size="sm"
																onClick={(e) => {
																	e.stopPropagation();
																	if (window.confirm("Are you sure you want to delete this note?")) {
																		const token = localStorage.getItem("token");
																		axios.delete(`${API_BASE}/api/notes/${note.id}`, {
																			headers: { Authorization: `Bearer ${token}` }
																		}).then(() => fetchNotes());
																	}
																}}
															>
																<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
															</ActionIcon>
														</Group>
														<Text size="xs" c="dimmed">
															Updated {new Date(note.updated_at).toLocaleDateString(undefined, {
																month: 'short',
																day: 'numeric',
																year: 'numeric',
																hour: '2-digit',
																minute: '2-digit'
															})}
														</Text>
													</div>
													<div className="mt-8 flex justify-end">
														<Text size="xs" fw={700} className="uppercase tracking-widest text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Open Note</Text>
													</div>
												</Stack>
											</Paper>
										))}
									</div>
								)}
							</Stack>
						</Container>
					) : (
						/* Editor View */
						<div className="flex flex-col h-full bg-white">
							<div className="px-8 py-4 border-b border-[var(--border-default)] flex items-center justify-between sticky top-0 bg-white z-10">
								<Group gap="lg">
									<ActionIcon
										variant="subtle"
										color="gray"
										size="lg"
										onClick={handleBack}
										radius="md"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
									</ActionIcon>
									<Divider orientation="vertical" />
									<input
										value={activeNote.title}
										onChange={(e) => {
											const newTitle = e.target.value;
											setActiveNote({ ...activeNote, title: newTitle });
											if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
											saveTimeoutRef.current = setTimeout(async () => {
												const token = localStorage.getItem("token");
												await axios.put(`${API_BASE}/api/notes/${activeNote.id}`, { title: newTitle }, {
													headers: { Authorization: `Bearer ${token}` }
												});
												setNotes(notes.map(n => n.id === activeNote.id ? { ...n, title: newTitle } : n));
											}, 1000);
										}}
										className="text-2xl font-bold bg-transparent border-none outline-none text-[var(--text-primary)] w-[400px]"
										placeholder="Untitled Note"
									/>
								</Group>
								<Group>
									{saving && <Loader size="xs" variant="dots" />}
								</Group>
							</div>
							<div className="flex-1 overflow-y-auto px-12 py-10 w-full">
								<div className="max-w-7xl mx-auto">
									<BlockNoteView
										editor={editor}
										theme="light"
										slashMenu={false}
										onChange={handleEditorChange}
									>
										<SuggestionMenuController
											triggerCharacter={"/"}
											getItems={async (query) =>
												getCustomSlashMenuItems(editor).filter((item) =>
													item.title.toLowerCase().includes(query.toLowerCase()) ||
													(item.aliases && item.aliases.some(alias => alias.toLowerCase().includes(query.toLowerCase())))
												)
											}
										/>
									</BlockNoteView>
								</div>
							</div>
						</div>
					)}
				</main>
				{activeNote && <OutputSidebar />}
			</div>
		</CodeOutputProvider>
	);
}
