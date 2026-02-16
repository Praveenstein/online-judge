import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
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
    Container
} from '@mantine/core';

const DSAChat = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
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

    const getDifficultyColor = (diff) => {
        const lower = diff.toLowerCase();
        if (lower.includes('easy')) return 'green';
        if (lower.includes('medium')) return 'yellow';
        if (lower.includes('hard')) return 'red';
        return 'blue';
    };

    return (
        <Container size="md" className="py-8">
            <Stack spacing="xl">
                <div className="text-center mb-8">
                    <Text size="xl" weight={700} className="text-[var(--text-primary)] mb-2">
                        DSA Problem Hunter
                    </Text>
                    <Text size="sm" color="dimmed" className="text-[var(--text-secondary)]">
                        Ask our AI to find the best practice problems for any topic
                    </Text>
                </div>

                <form onSubmit={handleSearch}>
                    <Group position="apart" align="flex-end">
                        <TextInput
                            placeholder="e.g., Graph Traversal problems for beginners"
                            label="What do you want to practice?"
                            value={query}
                            onChange={(e) => setQuery(e.currentTarget.value)}
                            className="flex-1"
                            size="md"
                            radius="md"
                            disabled={loading}
                        />
                        <Button
                            className="button-primary"
                            size="md"
                            radius="md"
                            onClick={handleSearch}
                            loading={loading}
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
                                <Stack spacing="md">
                                    <Group position="apart">
                                        <Text weight={600} size="lg" className="text-[var(--text-primary)]">
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
                                                className="card transition-all hover:-translate-y-1 hover:shadow-md"
                                                component="a"
                                                href={prob.url}
                                                target="_blank"
                                            >
                                                <Stack spacing="xs">
                                                    <Group position="apart">
                                                        <Text weight={500} lineClamp={1} className="text-[var(--text-primary)]">{prob.title}</Text>
                                                        <Badge color={getDifficultyColor(prob.difficulty)} variant="filled" size="xs">
                                                            {prob.difficulty}
                                                        </Badge>
                                                    </Group>
                                                    <Text size="xs" color="dimmed" className="truncate text-[var(--text-secondary)]">
                                                        {new URL(prob.url).hostname}
                                                    </Text>
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
                        <Text size="sm" color="dimmed italic">AI is searching the web for the best problems...</Text>
                    </Stack>
                )}
            </Stack>
        </Container>
    );
};

export default DSAChat;
