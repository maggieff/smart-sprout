import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, 
  FiMessageCircle, 
  FiUser,
  FiRefreshCw,
  FiHelpCircle,
  FiCamera
} from 'react-icons/fi';
import { aiService } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
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
  font-family: 'Karla', sans-serif;
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
  font-family: 'Karla', sans-serif;
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

const CameraButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: #4b5563;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const MessageImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 0.5rem;
`;

const CameraModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CameraContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const CameraPreview = styled.video`
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 0.5rem;
  background: #000;
`;

const CameraControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CaptureButton = styled.button`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: #10b981;
  border: 4px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-family: 'Karla', sans-serif;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const CloseButton = styled.button`
  padding: 0.5rem 1rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4b5563;
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
  font-family: 'Karla', sans-serif;
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
  const { messages, addMessage, clearMessages, isLoading, setLoading } = useChat();
  const [input, setInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const suggestions = [
    "How often should I water my plant?",
    "Why are my leaves turning yellow?",
    "What's the best lighting for my plant?",
    "How do I know if my plant is healthy?",
    "Should I fertilize my plant?",
    "Why is my plant drooping?"
  ];

  useEffect(() => {
    // Add welcome message only once when component mounts or plant changes
    if (messages.length === 0 && selectedPlant) {
      const getWelcomeMessage = async () => {
        let plantName = selectedPlant?.name || 'plant';
        
        // Try to get the actual species from photo analysis
        try {
          const photosResponse = await fetch(`http://localhost:5001/api/upload/photos?plantId=${selectedPlant?.id}`);
          if (photosResponse.ok) {
            const photos = await photosResponse.json();
            if (photos.photos && photos.photos.length > 0) {
              const latestPhoto = photos.photos[0];
              if (latestPhoto.analysis && latestPhoto.analysis.species && latestPhoto.analysis.species !== 'Unknown Plant') {
                plantName = latestPhoto.analysis.species;
              }
            }
          }
        } catch (error) {
          console.log('Could not fetch photo analysis for welcome message');
        }
        
        addMessage({
          id: 'welcome',
          text: `Hello! I'm your plant care assistant. I can help you with questions about your ${plantName}. What would you like to know?`,
          isUser: false,
          timestamp: new Date().toISOString()
        });
      };
      
      getWelcomeMessage();
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
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      // Get the most recent photo analysis to determine the actual plant species
      let actualSpecies = selectedPlant?.species;
      
      // Try to get species from recent photo analysis
      try {
        // First try with selectedPlant ID
        let photosResponse = await fetch(`http://localhost:5001/api/upload/photos?plantId=${selectedPlant?.id || 'unknown'}`);
        if (photosResponse.ok) {
          const photos = await photosResponse.json();
          if (photos.photos && photos.photos.length > 0) {
            const latestPhoto = photos.photos[0];
            if (latestPhoto.analysis && latestPhoto.analysis.species && latestPhoto.analysis.species !== 'Unknown Plant') {
              actualSpecies = latestPhoto.analysis.species;
              console.log(`🌱 Using photo-identified species: ${actualSpecies}`);
            }
          }
        }
        
        // If no photos found, try to get from recent uploads (for unknown plantId)
        if (!actualSpecies || actualSpecies === selectedPlant?.species) {
          photosResponse = await fetch(`http://localhost:5001/api/upload/photos?plantId=unknown`);
          if (photosResponse.ok) {
            const photos = await photosResponse.json();
            if (photos.photos && photos.photos.length > 0) {
              const latestPhoto = photos.photos[0];
              if (latestPhoto.analysis && latestPhoto.analysis.species && latestPhoto.analysis.species !== 'Unknown Plant') {
                actualSpecies = latestPhoto.analysis.species;
                console.log(`🌱 Using recent photo-identified species: ${actualSpecies}`);
              }
            }
          }
        }
      } catch (photoError) {
        console.log('Could not fetch photo analysis, using default species');
      }

      const response = await aiService.askQuestion({
        question: userMessage.text,
        plantId: selectedPlant?.id,
        userId: user?.id,
        species: actualSpecies,
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

      addMessage(aiMessage);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response');
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleCameraClick = async () => {
    // Check if camera is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera not supported on this device');
      return;
    }

    try {
      setShowCamera(true);
      setCameraError(null);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setCameraStream(stream);
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(error.message);
      toast.error('Camera access denied or not available');
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraError(null);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0);
      
      // Convert to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });
      
      // Create file from blob with proper MIME type
      const file = new File([blob], 'camera-capture.jpg', { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      console.log('📸 Created file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      
      // Close camera
      closeCamera();
      
      // Upload the captured photo
      await uploadCapturedPhoto(file);
      
    } catch (error) {
      console.error('Photo capture error:', error);
      toast.error('Failed to capture photo');
    }
  };

  const uploadCapturedPhoto = async (file) => {
    setUploadingImage(true);
    console.log('📸 Starting photo upload:', file.name, file.size);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('plantId', selectedPlant?.id || 'unknown');
      formData.append('description', 'Live camera capture for plant identification');

      console.log('📤 Uploading to:', 'http://localhost:5001/api/upload');
      
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Upload response status:', response.status);
      const result = await response.json();
      console.log('📥 Upload result:', result);

      if (result.success) {
        // Add image message to chat
        const imageMessage = {
          id: Date.now().toString(),
          text: `📸 I've captured a photo for plant identification`,
          isUser: true,
          timestamp: new Date().toISOString(),
          imageUrl: result.photo.url,
          imageAnalysis: result.photo.analysis
        };

        addMessage(imageMessage);

        // Add processing message
        const processingMessage = {
          id: (Date.now() + 0.5).toString(),
          text: `🔍 Analyzing your plant image... This may take a few seconds.`,
          isUser: false,
          timestamp: new Date().toISOString(),
          isProcessing: true
        };

        addMessage(processingMessage);

        // Replace processing message with AI response
        const aiResponse = {
          id: (Date.now() + 0.5).toString(), // Same ID as processing message
          text: `Based on your photo, I can help identify this plant. ${result.photo.analysis?.species ? `This appears to be a ${result.photo.analysis.species}.` : 'I\'m analyzing the image to identify the plant species.'} Would you like to know more about its care requirements?`,
          isUser: false,
          timestamp: new Date().toISOString(),
          confidence: result.photo.analysis?.confidence || 0.7
        };

        // Note: We can't easily replace messages in the shared context, so we'll just add the response
        addMessage(aiResponse);
        toast.success('Photo captured and uploaded successfully!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading captured photo:', error);
      toast.error('Failed to upload captured photo. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (event) => {
    console.log('📁 File input event:', event);
    console.log('📁 Event target:', event.target);
    console.log('📁 Files:', event.target.files);
    
    const file = event.target.files[0];
    console.log('📁 Selected file:', file);
    
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('plantId', selectedPlant?.id || 'unknown');
      formData.append('description', 'Plant identification request');

      console.log('📤 About to upload file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      console.log('📤 Upload URL:', 'http://localhost:5001/api/upload');
      
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response received:', response.status, response.statusText);
      const result = await response.json();

      if (result.success) {
        // Add image message to chat
        const imageMessage = {
          id: Date.now().toString(),
          text: `📸 I've uploaded a photo for plant identification`,
          isUser: true,
          timestamp: new Date().toISOString(),
          imageUrl: result.photo.url,
          imageAnalysis: result.photo.analysis
        };

        addMessage(imageMessage);

        // Add AI response about the plant identification
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: `Based on your photo, I can help identify this plant. ${result.photo.analysis?.species ? `This appears to be a ${result.photo.analysis.species}.` : 'I\'m analyzing the image to identify the plant species.'} Would you like to know more about its care requirements?`,
          isUser: false,
          timestamp: new Date().toISOString(),
          confidence: result.photo.analysis?.confidence || 0.7
        };

        addMessage(aiResponse);
        toast.success('Photo uploaded successfully!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error details:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

      {/* Camera Modal */}
      {showCamera && (
        <CameraModal onClick={closeCamera}>
          <CameraContainer onClick={(e) => e.stopPropagation()}>
            <h3>Take a Photo</h3>
            {cameraError ? (
              <div style={{ color: 'red', textAlign: 'center' }}>
                <p>Camera Error: {cameraError}</p>
                <CloseButton onClick={closeCamera}>Close</CloseButton>
              </div>
            ) : (
              <>
                <CameraPreview
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                />
                <CameraControls>
                  <CloseButton onClick={closeCamera}>Cancel</CloseButton>
                  <CloseButton onClick={() => {
                    closeCamera();
                    fileInputRef.current?.click();
                  }}>Upload File</CloseButton>
                  <CaptureButton onClick={capturePhoto} disabled={uploadingImage}>
                    📸
                  </CaptureButton>
                </CameraControls>
              </>
            )}
          </CameraContainer>
        </CameraModal>
      )}

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
                  {message.imageUrl && (
                    <ImageContainer>
                      <MessageImage 
                        src={message.imageUrl} 
                        alt="Uploaded plant photo"
                        onClick={() => window.open(message.imageUrl, '_blank')}
                      />
                    </ImageContainer>
                  )}
                </MessageContent>
                <MessageTime isUser={message.isUser}>
                  {formatTime(message.timestamp)}
                </MessageTime>
              </div>
            </Message>
          ))}
        </AnimatePresence>

        {isLoading && (
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
                 <CameraButton 
                   type="button" 
                   onClick={handleCameraClick}
                   disabled={uploadingImage}
                   title="Take photo with camera or upload from device"
                 >
                   <FiCamera />
                 </CameraButton>
                 <SendButton type="submit" disabled={!input.trim() || isLoading}>
                   <FiSend />
                 </SendButton>
               </InputForm>
               <HiddenFileInput
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 onChange={handleImageUpload}
               />
      </InputContainer>
    </ChatContainer>
  );
};

export default AIChat;
