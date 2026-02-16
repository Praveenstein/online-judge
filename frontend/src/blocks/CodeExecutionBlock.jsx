import { createReactBlockSpec } from "@blocknote/react";
import Editor from "@monaco-editor/react";
import { Button, Select, Group, Text, Box, ActionIcon, Tooltip } from "@mantine/core";
import { useCodeOutput } from "../context/CodeOutputContext";

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
            const { runCode, loading, toggleSidebar } = useCodeOutput();
            const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

            const handleRun = () => {
                runCode(API_BASE, props.block.props.language, props.block.props.code);
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
                        boxShadow: "var(--shadow-sm)",
                        margin: "12px 0"
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
                            <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: '0.05em' }}>
                                EXECUTABLE
                            </Text>
                        </Group>

                        <Group gap="xs">
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
                            <Tooltip label="Toggle Results Sidebar">
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={toggleSidebar}
                                    style={{ borderRadius: '4px' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
                                        <path d="M16 12H3" />
                                        <path d="M10 16l-4-4 4-4" />
                                    </svg>
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>

                    {/* Editor Area */}
                    <Box style={{ height: "300px", position: "relative", overflow: "hidden" }}>
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
