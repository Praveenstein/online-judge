import { Excalidraw } from "@excalidraw/excalidraw";

function Diagram() {
	return (
		<div style={{
			display: "flex",
			flexDirection: "column",
			height: "100vh",
			width: "100vw",
			overflow: "hidden"
		}}>
			<h1 style={{
				textAlign: "center",
				margin: "1rem 0",
				fontSize: "1.5rem",
				fontWeight: "bold"
			}}>
				Excalidraw Diagram
			</h1>
			<div style={{
				flex: 1,
				width: "100%",
				minHeight: 0
			}}>
				<Excalidraw />
			</div>
		</div>
	);
}

export default Diagram;
