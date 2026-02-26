import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    TextInput,
    Button,
    Paper,
    Text,
    Badge,
    Group,
    Stack,
    ActionIcon,
    Loader,
    Transition,
    Card,
    Container,
    Overlay,
    Center
} from '@mantine/core';

const DSAChat = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatingNote, setGeneratingNote] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const viewport = useRef(null);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${API_BASE}/api/dsa/search`,
                { query },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to fetch problems");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async (prob) => {
        setGeneratingNote(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${API_BASE}/api/notes/from-problem`,
                {
                    title: prob.title,
                    url: prob.url,
                    difficulty: prob.difficulty
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Redirect to notes page with the new note ID if needed, 
            // but just navigating to /notes is enough as it loads all notes.
            // Ideally we could pass the ID to open it automatically.
            navigate('/notes', { state: { selectedNoteId: response.data.id } });
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to generate note from problem");
            setGeneratingNote(false);
        }
    };

    const getDifficultyColor = (diff) => {
        const lower = diff.toLowerCase();
        if (lower.includes('easy')) return 'green';
        if (lower.includes('medium')) return 'yellow';
        if (lower.includes('hard')) return 'red';
        return 'blue';
    };

    return (
        <Container size="md" className="py-8 relative">
            {generatingNote && (
                <Overlay color="#000" opacity={0.6} zIndex={100} fixed blur={3}>
                    <Center h="100vh">
                        <Stack align="center" gap="md">
                            <Loader color="white" size="xl" variant="bars" />
                            <Text color="white" fw={700} size="lg">Generating your intelligent note...</Text>
                            <Text color="white" size="sm" opacity={0.8} px="xl" className="text-center">
                                Scaping problem details and generating code templates using AI. This may take a moment.
                            </Text>
                        </Stack>
                    </Center>
                </Overlay>
            )}

            <Stack gap="xl">
                <div className="text-center mb-8">
                    <Text size="xl" fw={700} className="text-[var(--text-primary)] mb-2">
                        DSA Problem Hunter
                    </Text>
                    <Text size="sm" c="dimmed" className="text-[var(--text-secondary)]">
                        Ask our AI to find the best practice problems for any topic
                    </Text>
                </div>

                <form onSubmit={handleSearch}>
                    <Group justify="space-between" align="flex-end">
                        <TextInput
                            placeholder="e.g., Graph Traversal problems for beginners"
                            label="What do you want to practice?"
                            value={query}
                            onChange={(e) => setQuery(e.currentTarget.value)}
                            className="flex-1"
                            size="md"
                            radius="md"
                            disabled={loading || generatingNote}
                        />
                        <Button
                            className="button-primary"
                            size="md"
                            radius="md"
                            onClick={handleSearch}
                            loading={loading}
                            disabled={generatingNote}
                        >
                            Search
                        </Button>
                    </Group>
                </form>

                {error && (
                    <Paper p="md" radius="md" withBorder className="bg-[var(--color-error-light)] border-[var(--color-error)]">
                        <Text color="red" size="sm">{error}</Text>
                    </Paper>
                )}

                <Transition mounted={!!results && !loading} transition="fade" duration={400} timingFunction="ease">
                    {(styles) => (
                        <div style={styles}>
                            {results && (
                                <Stack gap="md">
                                    <Group justify="space-between">
                                        <Text fw={600} size="lg" className="text-[var(--text-primary)]">
                                            Recommended for: {results.topic}
                                        </Text>
                                        <Badge variant="light" color="blue">
                                            {results.problems.length} Problems Found
                                        </Badge>
                                    </Group>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {results.problems.map((prob, idx) => (
                                            <Card
                                                key={idx}
                                                shadow="sm"
                                                padding="lg"
                                                radius="md"
                                                withBorder
                                                className="card transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer"
                                                onClick={() => handleCreateNote(prob)}
                                            >
                                                <Stack gap="xs">
                                                    <Group justify="space-between">
                                                        <Text fw={500} lineClamp={1} className="text-[var(--text-primary)]">{prob.title}</Text>
                                                        <Badge color={getDifficultyColor(prob.difficulty)} variant="filled" size="xs">
                                                            {prob.difficulty}
                                                        </Badge>
                                                    </Group>
                                                    <Group justify="space-between" align="center">
                                                        <Text size="xs" c="dimmed" className="truncate text-[var(--text-secondary)]">
                                                            {new URL(prob.url).hostname}
                                                        </Text>
                                                        <Text size="xs" fw={700} color="blue" className="uppercase tracking-tighter">Create Note →</Text>
                                                    </Group>
                                                </Stack>
                                            </Card>
                                        ))}
                                    </div>
                                </Stack>
                            )}
                        </div>
                    )}
                </Transition>

                {loading && (
                    <Stack align="center" py="xl">
                        <Loader size="lg" variant="dots" />
                        <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>AI is searching the web for the best problems...</Text>
                    </Stack>
                )}
            </Stack>
        </Container>
    );
};

export default DSAChat;
