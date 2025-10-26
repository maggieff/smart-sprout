import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, 
  FiMessageCircle, 
  FiUser,
  FiRefreshCw,
  FiHelpCircle
} from 'react-icons/fi';
import { aiService } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  background: white;
  border-radius: 1rem 1rem 0 0;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e5e7eb;
`;

const ChatTitle = styled.h1`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.875rem;
  font-weight: normal;
  color: #1f2937;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChatSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

const MessagesContainer = styled.div`
  flex: 1;
  background: white;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled(motion.div)`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  ${props => props.isUser && 'flex-direction: row-reverse;'}
`;

const MessageAvatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser ? '#10b981' : '#f3f4f6'};
  color: ${props => props.isUser ? 'white' : '#6b7280'};
  font-size: 1rem;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  max-width: 70%;
  background: ${props => props.isUser ? '#10b981' : '#f9fafb'};
  color: ${props => props.isUser ? 'white' : '#374151'};
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const InputContainer = styled.div`
  background: white;
  border-radius: 0 0 1rem 1rem;
  padding: 1.5rem;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  border-top: 1px solid #e5e7eb;
`;

const InputForm = styled.form`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`;

const InputField = styled.textarea`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: none;
  min-height: 2.5rem;
  max-height: 6rem;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SuggestionsContainer = styled.div`
  margin-bottom: 1rem;
`;

const SuggestionsTitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
`;

const SuggestionButton = styled.button`
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
`;

const AIChat = ({ selectedPlant }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "How often should I water my plant?",
    "Why are my leaves turning yellow?",
    "What's the best lighting for my plant?",
    "How do I know if my plant is healthy?",
    "Should I fertilize my plant?",
    "Why is my plant drooping?"
  ];

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        text: `Hello! I'm your plant care assistant. I can help you with questions about your ${selectedPlant?.name || 'plant'}. What would you like to know?`,
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [selectedPlant]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.askQuestion({
        question: userMessage.text,
        plantId: selectedPlant?.id,
        userId: user?.id,
        species: selectedPlant?.species,
        sensorData: selectedPlant?.sensorData
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        isUser: false,
        timestamp: new Date().toISOString(),
        confidence: response.confidence,
        sources: response.sources
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response');
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>
          <FiMessageCircle />
          AI Plant Assistant
        </ChatTitle>
        <ChatSubtitle>
          Ask me anything about your {selectedPlant?.name || 'plant'} care
        </ChatSubtitle>
      </ChatHeader>

      <MessagesContainer>
        <AnimatePresence>
          {messages.map((message) => (
            <Message
              key={message.id}
              isUser={message.isUser}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageAvatar isUser={message.isUser}>
                {message.isUser ? <FiUser /> : <FiMessageCircle />}
              </MessageAvatar>
              <div>
                <MessageContent isUser={message.isUser}>
                  {message.text}
                </MessageContent>
                <MessageTime isUser={message.isUser}>
                  {formatTime(message.timestamp)}
                </MessageTime>
              </div>
            </Message>
          ))}
        </AnimatePresence>

        {loading && (
          <Message>
            <MessageAvatar>
              <FiMessageCircle />
            </MessageAvatar>
            <div>
              <MessageContent>
                <LoadingMessage>
                  <FiRefreshCw className="animate-spin" />
                  Thinking...
                </LoadingMessage>
              </MessageContent>
            </div>
          </Message>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        {messages.length === 1 && (
          <SuggestionsContainer>
            <SuggestionsTitle>
              <FiHelpCircle />
              Try asking:
            </SuggestionsTitle>
            <SuggestionsGrid>
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <SuggestionButton
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </SuggestionButton>
              ))}
            </SuggestionsGrid>
          </SuggestionsContainer>
        )}

        <InputForm onSubmit={handleSubmit}>
          <InputField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your plant care..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <SendButton type="submit" disabled={!input.trim() || loading}>
            <FiSend />
          </SendButton>
        </InputForm>
      </InputContainer>
    </ChatContainer>
  );
};

export default AIChat;
