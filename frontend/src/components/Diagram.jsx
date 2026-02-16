import { Excalidraw } from "@excalidraw/excalidraw";

const Diagram = () => {
	return (
		<div className="flex flex-col h-[calc(100vh-100px)] w-full overflow-hidden bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)]">
			<h1 className="text-center py-4 text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border-default)] bg-[var(--bg-secondary)]">
				Excalidraw Diagram
			</h1>
			<div className="flex-1 w-full min-h-0">
				<Excalidraw />
			</div>
		</div>
	);
};

export default Diagram;
