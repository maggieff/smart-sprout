import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, 
  FiMessageCircle, 
  FiUser,
  FiRefreshCw,
  FiMinimize2,
  FiMaximize2
} from 'react-icons/fi';
import { aiService } from '../services/aiService';
import { logService } from '../services/logService';
import { useChat } from '../contexts/ChatContext';
import toast from 'react-hot-toast';

const ChatContainer = styled.div`
  background: #65876a;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #5a6b5d;
  color: white;
  display: flex;
  flex-direction: column;
  height: ${props => props.isExpanded ? '600px' : '450px'};
  transition: height 0.3s ease;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ChatTitle = styled.h3`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.25rem;
  font-weight: normal;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExpandButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  font-family: 'Karla', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const Message = styled(motion.div)`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  ${props => props.isUser && 'flex-direction: row-reverse;'}
`;

const MessageAvatar = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser ? '#9CAF88' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.isUser ? 'white' : '#E5E7EB'};
  font-size: 0.75rem;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  max-width: 85%;
  background: ${props => props.isUser ? '#9CAF88' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.isUser ? 'white' : '#E5E7EB'};
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.8rem;
  line-height: 1.4;
  word-wrap: break-word;
  font-family: 'Karla', sans-serif;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
`;

const InputField = styled.textarea`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-family: 'Karla', sans-serif;
  resize: none;
  min-height: 2rem;
  max-height: 4rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: #9CAF88;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const SendButton = styled.button`
  background: #9CAF88;
  border: none;
  border-radius: 0.5rem;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  
  &:hover:not(:disabled) {
    background: #7A8B73;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
  
  div {
    width: 0.25rem;
    height: 0.25rem;
    background: #9CAF88;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const PlantChat = ({ plant }) => {
  const { messages, addMessage, clearMessages, isLoading, setLoading } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [plantLogs, setPlantLogs] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPlantLogs = useCallback(async () => {
    try {
      const response = await logService.getLogs(plant.id);
      if (response.logs) {
        setPlantLogs(response.logs);
      }
    } catch (error) {
      console.error('Error loading plant logs:', error);
    }
  }, [plant?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load plant logs when component mounts
  useEffect(() => {
    if (plant?.id) {
      loadPlantLogs();
    }
  }, [plant?.id, loadPlantLogs]);


  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setLoading(true);

    // Add user message to shared context
    addMessage({
      id: Date.now(),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    });

    try {
      const response = await aiService.askQuestion({
        question: userMessage,
        plantId: plant?.id,
        species: plant?.species,
        sensorData: plant?.sensorData
      });
      
      addMessage({
        id: Date.now() + 1,
        text: response.answer,
        isUser: false,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      addMessage({
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    clearMessages();
  };

  return (
    <ChatContainer isExpanded={isExpanded}>
      <ChatHeader>
        <ChatTitle>
          <FiMessageCircle />
          Plant Care Assistant
        </ChatTitle>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ExpandButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
            {isExpanded ? 'Minimize' : 'Expand'}
          </ExpandButton>
          {messages.length > 0 && (
            <ExpandButton onClick={clearChat}>
              <FiRefreshCw size={14} />
              Clear
            </ExpandButton>
          )}
        </div>
      </ChatHeader>

      <MessagesContainer>
        {messages.length === 0 && (
          <Message>
            <MessageAvatar isUser={false}>
              <FiMessageCircle />
            </MessageAvatar>
            <MessageContent isUser={false}>
              Hi! I'm your plant care assistant for {plant?.name}. Ask me anything about caring for your plant, and I'll analyze your care logs to give you personalized advice! 🌱
            </MessageContent>
          </Message>
        )}
        
        <AnimatePresence>
          {messages.map((message) => (
            <Message
              key={message.id}
              isUser={message.isUser}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MessageAvatar isUser={message.isUser}>
                {message.isUser ? <FiUser /> : <FiMessageCircle />}
              </MessageAvatar>
              <MessageContent isUser={message.isUser}>
                {message.text}
              </MessageContent>
            </Message>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <Message>
            <MessageAvatar isUser={false}>
              <FiMessageCircle />
            </MessageAvatar>
            <MessageContent isUser={false}>
              <LoadingDots>
                <div></div>
                <div></div>
                <div></div>
              </LoadingDots>
            </MessageContent>
          </Message>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputField
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your plant's care..."
          disabled={isLoading}
        />
        <SendButton onClick={sendMessage} disabled={!inputValue.trim() || isLoading}>
          <FiSend size={14} />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default PlantChat;
