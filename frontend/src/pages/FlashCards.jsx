import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Title,
    Text,
    Button,
    Card,
    Stack,
    Group,
    Loader,
    Paper,
    Transition,
    Center,
    Badge,
    ActionIcon,
    Divider,
    Box
} from '@mantine/core';
import ReactMarkdown from 'react-markdown';

const FlashCardItem = ({ card }) => {
    const [flipped, setFlipped] = useState(false);

    // Reset flip state when card changes
    useEffect(() => {
        setFlipped(false);
    }, [card]);

    return (
        <Card
            shadow="lg"
            radius="lg"
            padding="xl"
            p={0}
            className="flashcard-container"
            style={{
                height: '450px',
                cursor: 'pointer',
                perspective: '1000px',
                background: 'transparent',
                border: 'none',
                maxWidth: '800px',
                width: '100%',
                margin: '0 auto'
            }}
            onClick={() => setFlipped(!flipped)}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
                {/* Front */}
                <Paper
                    withBorder
                    p="xl"
                    radius="lg"
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'var(--bg-primary)',
                        overflowY: 'auto'
                    }}
                >
                    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Badge variant="light" color="blue" mb="md">Question / Concept</Badge>
                        <Box style={{ fontSize: '1.25rem', fontWeight: 600, textAlign: 'center', width: '100%' }}>
                            <ReactMarkdown
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        return (
                                            <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono text-sm" {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {card.front}
                            </ReactMarkdown>
                        </Box>
                        {card.problem_context && (
                            <Text size="xs" c="dimmed" mt="md">Context: {card.problem_context}</Text>
                        )}
                    </Box>
                    <Center mt="md">
                        <Text size="xs" c="dimmed">Click to reveal answer</Text>
                    </Center>
                </Paper>

                {/* Back */}
                <Paper
                    withBorder
                    p="xl"
                    radius="lg"
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'var(--bg-secondary)',
                        transform: 'rotateY(180deg)',
                        overflowY: 'auto'
                    }}
                >
                    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Badge variant="light" color="green" mb="md">Insight / Logic</Badge>
                        <Box style={{ width: '100%', textAlign: 'left', fontSize: '1rem' }} className="markdown-body">
                            <ReactMarkdown
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline ? (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-mono text-sm inline-block" {...props}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    pre({ node, children, ...props }) {
                                        return (
                                            <pre className="p-4 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-default)] overflow-x-auto my-4 text-sm" {...props}>
                                                {children}
                                            </pre>
                                        )
                                    },
                                    p({ node, children, ...props }) {
                                        return <p style={{ marginBottom: '12px' }} {...props}>{children}</p>
                                    },
                                    ul({ node, children, ...props }) {
                                        return <ul style={{ paddingLeft: '20px', marginBottom: '12px', listStyleType: 'disc' }} {...props}>{children}</ul>
                                    },
                                    ol({ node, children, ...props }) {
                                        return <ol style={{ paddingLeft: '20px', marginBottom: '12px', listStyleType: 'decimal' }} {...props}>{children}</ol>
                                    },
                                    h1({ node, children, ...props }) { return <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px', marginTop: '16px' }} {...props}>{children}</h1> },
                                    h2({ node, children, ...props }) { return <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px', marginTop: '16px' }} {...props}>{children}</h2> },
                                    h3({ node, children, ...props }) { return <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', marginTop: '16px' }} {...props}>{children}</h3> },
                                }}
                            >
                                {card.back}
                            </ReactMarkdown>
                        </Box>
                    </Box>
                    <Center mt="md">
                        <Text size="xs" c="dimmed">Click to flip back</Text>
                    </Center>
                </Paper>
            </div>
        </Card>
    );
};

const FlashCards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState("");
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const fetchCards = async () => {
        setLoading(true);
        setError(null);
        setCurrentIndex(0);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE}/api/flash-cards/generate`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCards(response.data.cards);
            setSummary(response.data.summary);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to generate flash cards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <Container size="md" className="py-12">
            <Stack gap="xl">
                <div className="text-center">
                    <Title order={1} className="mb-2">Personalized Flash Cards</Title>
                    <Text c="dimmed">AI-generated reinforcement based on your recent problem attempts</Text>
                </div>

                <Divider />

                {loading ? (
                    <Center py={100}>
                        <Stack align="center">
                            <Loader size="xl" variant="bars" />
                            <Text fw={700}>AI is analyzing your performance and crafting cards...</Text>
                        </Stack>
                    </Center>
                ) : error ? (
                    <Paper p="xl" radius="md" withBorder className="bg-red-50 border-red-200 text-center">
                        <Text color="red">{error}</Text>
                        <Button variant="outline" color="red" mt="md" onClick={fetchCards}>Try Again</Button>
                    </Paper>
                ) : cards.length > 0 ? (
                    <Stack gap="xl">
                        <FlashCardItem card={cards[currentIndex]} />

                        <Group justify="center" mt="md" align="center">
                            <Button
                                variant="default"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                            >
                                Previous
                            </Button>
                            <Text size="sm" fw={500} style={{ minWidth: '60px', textAlign: 'center' }}>
                                {currentIndex + 1} / {cards.length}
                            </Text>
                            <Button
                                variant="default"
                                onClick={handleNext}
                                disabled={currentIndex === cards.length - 1}
                            >
                                Next
                            </Button>
                        </Group>

                        <Center mt="md">
                            <Button variant="subtle" size="xs" onClick={fetchCards}>Regenerate Cards</Button>
                        </Center>
                    </Stack>
                ) : (
                    <Paper p="xl" radius="md" withBorder className="text-center py-20 opacity-60">
                        <Box mb="md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="4"></line><line x1="8" y1="2" x2="8" y2="4"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </Box>
                        <Title order={3}>No cards available yet</Title>
                        <Text size="sm" c="dimmed" mt="xs">Complete and <b>Save</b> your problem attempts to receive personalized practice cards.</Text>
                        <Text size="xs" c="dimmed" mt="xs">You'll find a "Save Attempt" button in the results sidebar or the problem solve page.</Text>
                    </Paper>
                )}
            </Stack>
        </Container>
    );
};

export default FlashCards;
