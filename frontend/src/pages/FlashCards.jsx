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

const FlashCardItem = ({ card, onSave, onDelete, isSavedMode, isAlreadySaved, isSaving, isDeleting }) => {
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
            {/* Card Actions Overlay (placed outside flipping div so it is always accessible) */}
            <Group style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 10 }}>
                {isSavedMode ? (
                    <Button
                        variant="filled"
                        color="red"
                        size="xs"
                        onClick={(e) => { e.stopPropagation(); onDelete(card); }}
                        loading={isDeleting}
                    >
                        Delete
                    </Button>
                ) : (
                    <Button
                        variant={isAlreadySaved ? "light" : "filled"}
                        color={isAlreadySaved ? "gray" : "blue"}
                        size="xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isAlreadySaved) onSave(card);
                        }}
                        loading={isSaving}
                        disabled={isAlreadySaved}
                    >
                        {isAlreadySaved ? "Saved ✓" : "Save for Later"}
                    </Button>
                )}
            </Group>
        </Card>
    );
};

const FlashCards = () => {
    const [savedCards, setSavedCards] = useState([]);
    const [generatedCards, setGeneratedCards] = useState([]);
    const [mode, setMode] = useState("saved"); // "saved" or "generate"
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const fetchSavedCards = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE}/api/flash-cards/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedCards(response.data);
            setCurrentIndex(0);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to load saved flash cards");
        } finally {
            setLoading(false);
        }
    };

    const fetchGeneratedCards = async () => {
        setLoading(true);
        setError(null);
        setCurrentIndex(0);
        setMode("generate");
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE}/api/flash-cards/generate`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGeneratedCards(response.data.cards);
            setSummary(response.data.summary);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to generate flash cards");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCard = async (card) => {
        setSavingId(card.front); // Use string front as temp ID for saving state tracking
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE}/api/flash-cards/`, card, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedCards(prev => [response.data, ...prev]);
        } catch (err) {
            console.error("Failed to save card:", err);
            // Optionally set error toast here
        } finally {
            setSavingId(null);
        }
    };

    const handleDeleteCard = async (card) => {
        setDeletingId(card.id);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE}/api/flash-cards/${card.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedCards(prev => prev.filter(c => c.id !== card.id));
            if (currentIndex >= savedCards.length - 1 && currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
        } catch (err) {
            console.error("Failed to delete card:", err);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchSavedCards();
    }, []);

    const handleNext = () => {
        const activeList = mode === "saved" ? savedCards : generatedCards;
        if (currentIndex < activeList.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const activeCards = mode === "saved" ? savedCards : generatedCards;

    return (
        <Container size="md" className="py-12">
            <Stack gap="xl">
                <div className="text-center">
                    <Title order={1} className="mb-2">Practice Flash Cards</Title>
                    <Text c="dimmed">AI-generated reinforcement and your personalized saved collection</Text>
                </div>

                <Group justify="center" gap="md">
                    <Button
                        variant={mode === "saved" ? "filled" : "light"}
                        onClick={() => { setMode("saved"); setCurrentIndex(0); fetchSavedCards(); }}
                    >
                        Saved Cards ({savedCards.length})
                    </Button>
                    <Button
                        variant={mode === "generate" ? "filled" : "light"}
                        onClick={() => { setMode("generate"); fetchGeneratedCards(); }}
                    >
                        Generate New
                    </Button>
                </Group>

                <Divider />

                {loading ? (
                    <Center py={100}>
                        <Stack align="center">
                            <Loader size="xl" variant="bars" />
                            <Text fw={700}>
                                {mode === "generate" ? "AI is analyzing your performance and crafting cards..." : "Loading saved cards..."}
                            </Text>
                        </Stack>
                    </Center>
                ) : error ? (
                    <Paper p="xl" radius="md" withBorder className="bg-red-50 border-red-200 text-center">
                        <Text color="red">{error}</Text>
                        <Button variant="outline" color="red" mt="md" onClick={mode === "saved" ? fetchSavedCards : fetchGeneratedCards}>Try Again</Button>
                    </Paper>
                ) : activeCards.length > 0 ? (
                    <Stack gap="xl">
                        <FlashCardItem
                            card={activeCards[currentIndex]}
                            isSavedMode={mode === "saved"}
                            isAlreadySaved={savedCards.some(sc => sc.front === activeCards[currentIndex]?.front)}
                            onSave={handleSaveCard}
                            onDelete={handleDeleteCard}
                            isSaving={savingId === activeCards[currentIndex].front}
                            isDeleting={deletingId === activeCards[currentIndex]?.id}
                        />

                        <Group justify="center" mt="md" align="center">
                            <Button
                                variant="default"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                            >
                                Previous
                            </Button>
                            <Text size="sm" fw={500} style={{ minWidth: '60px', textAlign: 'center' }}>
                                {currentIndex + 1} / {activeCards.length}
                            </Text>
                            <Button
                                variant="default"
                                onClick={handleNext}
                                disabled={currentIndex === activeCards.length - 1}
                            >
                                Next
                            </Button>
                        </Group>
                    </Stack>
                ) : (
                    <Paper p="xl" radius="md" withBorder className="text-center py-20 opacity-60">
                        <Box mb="md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="4"></line><line x1="8" y1="2" x2="8" y2="4"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </Box>
                        <Title order={3}>{mode === "saved" ? "No saved cards yet" : "No new cards generated"}</Title>
                        <Text size="sm" c="dimmed" mt="xs">
                            {mode === "saved"
                                ? "Click 'Generate New' and save cards to build your collection."
                                : "Complete and save your problem attempts to receive personalized practice cards."}
                        </Text>
                    </Paper>
                )}
            </Stack>
        </Container>
    );
};

export default FlashCards;
