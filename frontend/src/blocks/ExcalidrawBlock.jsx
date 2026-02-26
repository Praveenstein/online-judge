import { createReactBlockSpec } from "@blocknote/react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useState, useCallback, useEffect } from "react";
import { Modal, Button, ActionIcon, Tooltip, Group } from "@mantine/core";
// import { IconEdit, IconMaximize, IconTrash } from "@tabler/icons-react"; // Removed as not installed // Assuming tabler icons are available via Mantine or similar, checking package.json might be needed. 
// If tabler icons are not installed, I will use simple text or unicode or svg. 
// package.json didn't explicitly check for tabler icons but mantine usually comes with them or requires them.
// Let's use simple SVGs if not sure, but Mantine v7+ usually recommends independent installation. 
// I'll stick to text buttons or basic unicode for safety unless I verify.
// Actually, I'll use simple inline SVGs for icons to be safe and look "premium".

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

            useEffect(() => {
                if (excalidrawAPI && initialData) {
                    excalidrawAPI.updateScene({ elements: initialData });
                }
            }, [initialData, excalidrawAPI]);

            const handleSave = (elements, appState) => {
                // Save elements
                props.editor.updateBlock(props.block, {
                    props: { data: JSON.stringify(elements) }
                });
            };

            return (
                <div className={"excalidraw-block-container"}
                    style={{
                        width: "100%",
                        padding: "0",
                        border: "1px solid var(--border-default)",
                        borderRadius: "12px",
                        background: "var(--bg-primary)",
                        overflow: "hidden",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        transition: "all 0.2s ease-in-out",
                        position: "relative"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                        e.currentTarget.querySelector('.excalidraw-controls').style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                        e.currentTarget.querySelector('.excalidraw-controls').style.opacity = '0';
                    }}
                >
                    {/* Header / Controls */}
                    <div className="excalidraw-controls" style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        zIndex: 10,
                        display: "flex",
                        gap: "8px",
                        opacity: 0, // Hidden by default, shown on hover
                        transition: "opacity 0.2s ease"
                    }}>
                        <Button
                            size="xs"
                            variant="filled"
                            color="blue"
                            onClick={() => setOpened(true)}
                            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                            leftSection={
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            }
                        >
                            Edit
                        </Button>
                    </div>

                    <div
                        style={{
                            height: "400px",
                            width: "100%",
                            position: "relative",
                        }}
                    >
                        {initialData && initialData.length > 0 ? (
                            // Preview Mode
                            <div style={{ width: "100%", height: "100%" }}>
                                <Excalidraw
                                    initialData={{
                                        elements: initialData,
                                        appState: {
                                            viewModeEnabled: true,
                                            zenModeEnabled: true,
                                            gridModeEnabled: false,
                                            scrollToContent: true // Attempt to auto-scroll to content
                                        }
                                    }}
                                    viewModeEnabled={true}
                                    zenModeEnabled={true}
                                    gridModeEnabled={false}
                                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                                    UIGptions={{ canvasActions: { loadScene: false, saveToActiveFile: false, toggleTheme: false, saveAsImage: false, export: false }, canvasBackgroundColor: "white" }}
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    background: "var(--bg-secondary)",
                                    cursor: "pointer",
                                    color: "var(--text-secondary)"
                                }}
                                onClick={() => setOpened(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px", opacity: 0.5 }}>
                                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                                    <path d="M2 2l7.586 7.586"></path>
                                    <circle cx="11" cy="11" r="2"></circle>
                                </svg>
                                <span style={{ fontWeight: 500 }}>Empty Canvas</span>
                                <span style={{ fontSize: "0.875rem", opacity: 0.8, marginTop: "4px" }}>Click to start drawing</span>
                            </div>
                        )}
                    </div>

                    <Modal
                        opened={opened}
                        onClose={() => setOpened(false)}
                        title="Edit Sketch"
                        size="100%"
                        fullScreen
                        styles={{
                            header: { borderBottom: '1px solid #e0e0e0', padding: '10px 20px' },
                            body: { height: 'calc(100vh - 60px)', padding: 0 }
                        }}
                    >
                        <div style={{ height: "100%", width: "100%" }}>
                            <Excalidraw
                                initialData={{ elements: initialData, appState: { viewModeEnabled: false } }}
                                onChange={(elements, appState) => handleSave(elements, appState)}
                            />
                        </div>
                    </Modal>
                </div>
            );
        },
    }
);
