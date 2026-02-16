import { createReactBlockSpec } from "@blocknote/react";
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { useState, useEffect } from "react";
import { Modal } from "@mantine/core"; // Using Mantine modal since BlockNote uses Mantine

export const ExcalidrawBlock = createReactBlockSpec(
    {
        type: "excalidraw",
        propSchema: {
            data: {
                default: "[]",
            },
        },
        content: "none",
    },
    {
        render: (props) => {
            const [opened, setOpened] = useState(false);
            const [excalidrawAPI, setExcalidrawAPI] = useState(null);

            // Parse data safely
            const initialData = JSON.parse(props.block.props.data || "[]");

            const handleSave = (elements, appState) => {
                // We only save elements for now to keep it simple, or we could save appState too if needed
                // But for the block prop, let's just serialize the elements.
                // Actually, saving the whole scene data including appState might be better for view mode consistency (like background color)
                // For this MVP, let's stick to elements.
                props.editor.updateBlock(props.block, {
                    props: { data: JSON.stringify(elements) }
                });
            };

            return (
                <div className={"excalidraw-block-container"} style={{ width: "100%", padding: "10px", border: "1px solid #e0e0e0", borderRadius: "8px", background: "#f9f9f9" }}>
                    <div
                        onClick={() => setOpened(true)}
                        style={{
                            cursor: "pointer",
                            height: "300px",
                            width: "100%",
                            position: "relative",
                            overflow: "hidden",
                            pointerEvents: opened ? "none" : "auto" // Disable pointer events on preview when not editing to prevent accidental interactions if we used a real Excalidraw instance
                        }}
                    >
                        {initialData && initialData.length > 0 ? (
                            // Preview Mode
                            <div style={{ pointerEvents: "none", width: "100%", height: "100%" }}>
                                <Excalidraw
                                    initialData={{ elements: initialData, appState: { viewModeEnabled: true } }}
                                    viewModeEnabled={true}
                                    zenModeEnabled={true}
                                    gridModeEnabled={false}
                                />
                            </div>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#888" }}>
                                Click to create a sketch
                            </div>
                        )}
                    </div>

                    <Modal
                        opened={opened}
                        onClose={() => setOpened(false)}
                        title="Edit Sketch"
                        size="100%"
                        fullScreen
                        styles={{ body: { height: 'calc(100vh - 60px)' } }} // Adjust for header
                    >
                        <div style={{ height: "100%", width: "100%" }}>
                            <Excalidraw
                                initialData={{ elements: initialData }}
                                onChange={(elements, appState) => handleSave(elements, appState)}
                            />
                        </div>
                    </Modal>
                </div>
            );
        },
    }
);
