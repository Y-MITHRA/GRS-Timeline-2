import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SmartQuery = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your Smart Query Assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            text: input,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // TODO: Replace with actual API call to your backend
            const response = await fetch('/api/smart-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: input }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Add bot response
            const botMessage = {
                id: messages.length + 2,
                text: data.response,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            toast.error('Failed to get response from the assistant');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="smart-query-container">
            <Card className="chat-container">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        <Bot size={24} className="me-2" />
                        <h5 className="mb-0">Smart Query Assistant</h5>
                    </div>
                    <Button variant="outline-secondary" size="sm" onClick={() => setMessages([messages[0]])}>
                        <RefreshCw size={16} />
                    </Button>
                </Card.Header>
                <Card.Body className="messages-container">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                        >
                            <div className="message-icon">
                                {message.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className="message-content">
                                <div className="message-text">{message.text}</div>
                                <div className="message-timestamp">
                                    {message.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message bot-message">
                            <div className="message-icon">
                                <Bot size={20} />
                            </div>
                            <div className="message-content">
                                <div className="message-text">
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Thinking...
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </Card.Body>
                <Card.Footer>
                    <Form onSubmit={handleSubmit} className="d-flex">
                        <Form.Control
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your query here..."
                            className="me-2"
                            disabled={loading}
                        />
                        <Button type="submit" variant="primary" disabled={loading}>
                            <Send size={20} />
                        </Button>
                    </Form>
                </Card.Footer>
            </Card>
        </div>
    );
};

export default SmartQuery; 