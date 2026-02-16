import { createReactBlockSpec } from "@blocknote/react";
import Editor from "@monaco-editor/react";
import { useState } from "react";
import { Button, Select, Group, Text, Box } from "@mantine/core";
import axios from "axios";

export const CodeExecutionBlock = createReactBlockSpec(
    {
        type: "codeExecution",
        propSchema: {
            language: {
                default: "python",
            },
            code: {
                default: "# Write your code here",
            },
        },
        content: "none",
    },
    {
        render: (props) => {
            const [loading, setLoading] = useState(false);
            const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

            const handleRun = async () => {
                setLoading(true);
                console.log(`[CodeExecution] Running ${props.block.props.language} code...`);
                try {
                    const token = localStorage.getItem("token");
                    const response = await axios.post(
                        `${API_BASE}/execute/`,
                        {
                            language: props.block.props.language,
                            code: props.block.props.code,
                            input_data: "" // Focusing on UI and API for now
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    console.log("[CodeExecution] Result:", response.data);
                } catch (err) {
                    console.error("[CodeExecution] Error:", err.response?.data?.detail ?? err.message);
                }
                setLoading(false);
            };

            return (
                <Box
                    className="code-execution-block"
                    style={{
                        width: "100%",
                        border: "1px solid var(--border-default)",
                        borderRadius: "8px",
                        overflow: "hidden",
                        background: "var(--bg-primary)",
                        boxShadow: "var(--shadow-sm)"
                    }}
                >
                    {/* Header Controls */}
                    <Group
                        justify="space-between"
                        p="xs"
                        style={{
                            background: "var(--bg-secondary)",
                            borderBottom: "1px solid var(--border-default)"
                        }}
                    >
                        <Group gap="xs">
                            <Select
                                size="xs"
                                value={props.block.props.language}
                                onChange={(value) => props.editor.updateBlock(props.block, {
                                    props: { language: value }
                                })}
                                data={[
                                    { value: 'python', label: 'Python' },
                                    { value: 'cpp', label: 'C++' },
                                    { value: 'golang', label: 'Go' },
                                ]}
                                styles={{
                                    input: {
                                        backgroundColor: "var(--bg-primary)",
                                        borderColor: "var(--border-default)",
                                        color: "var(--text-primary)",
                                        width: "100px"
                                    }
                                }}
                            />
                            <Text size="xs" c="dimmed" fw={500}>
                                EXECUTABLE CODE
                            </Text>
                        </Group>
                        <Button
                            size="xs"
                            variant="filled"
                            color="blue"
                            onClick={handleRun}
                            loading={loading}
                            leftSection={
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            }
                        >
                            Run
                        </Button>
                    </Group>

                    {/* Editor Area */}
                    <Box style={{ height: "300px", position: "relative" }}>
                        <Editor
                            height="100%"
                            language={props.block.props.language === "golang" ? "go" : props.block.props.language}
                            theme="vs-dark"
                            value={props.block.props.code}
                            onChange={(value) => props.editor.updateBlock(props.block, {
                                props: { code: value }
                            })}
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 12, bottom: 12 }
                            }}
                        />
                    </Box>
                </Box>
            );
        },
    }
);
