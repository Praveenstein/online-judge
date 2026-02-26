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

const FlashCardItem = ({ card }) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <Card
            shadow="lg"
            radius="lg"
            padding="xl"
            p={0}
            className="flashcard-container"
            style={{
                height: '350px',
                cursor: 'pointer',
                perspective: '1000px',
                background: 'transparent',
                border: 'none'
            }}
            onClick={() => setFlipped(!flipped)}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
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
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-primary)',
                        gap: '20px'
                    }}
                >
                    <Badge variant="light" color="blue">Question / Concept</Badge>
                    <Title order={3} className="text-center">{card.front}</Title>
                    {card.problem_context && (
                        <Text size="xs" c="dimmed">Context: {card.problem_context}</Text>
                    )}
                    <Text size="xs" c="dimmed" mt="xl">Click to reveal answer</Text>
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
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-secondary)',
                        transform: 'rotateY(180deg)',
                        gap: '20px'
                    }}
                >
                    <Badge variant="light" color="green">Insight / Logic</Badge>
                    <Text size="md" className="text-center">{card.back}</Text>
                    <Text size="xs" c="dimmed" mt="xl">Click to flip back</Text>
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
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const fetchCards = async () => {
        setLoading(true);
        setError(null);
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {cards.map((card, idx) => (
                                <FlashCardItem key={idx} card={card} />
                            ))}
                        </div>
                        <Center>
                            <Button variant="subtle" size="md" onClick={fetchCards}>Regenerate Cards</Button>
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
