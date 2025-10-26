import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const Title = styled.h2`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.5rem;
  font-weight: normal;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  padding: 0.25rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#1f2937' : '#6b7280'};
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: ${props => props.hasIcon ? '2.5rem' : '1rem'};
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Icon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    color: #374151;
    background: #f3f4f6;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: #10B981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background: #059669;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (activeTab === 'signin') {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        toast.success(activeTab === 'signin' ? 'Signed in successfully!' : 'Account created successfully!');
        onClose();
        setFormData({ name: '', email: '', password: '' });
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleClose = () => {
    onClose();
    setFormData({ name: '', email: '', password: '' });
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <ModalContent
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={handleClose}>
              <FiX size={20} />
            </CloseButton>

            <Title>
              {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
            </Title>

            <TabContainer>
              <Tab 
                active={activeTab === 'signin'} 
                onClick={() => handleTabChange('signin')}
              >
                Sign In
              </Tab>
              <Tab 
                active={activeTab === 'signup'} 
                onClick={() => handleTabChange('signup')}
              >
                Sign Up
              </Tab>
            </TabContainer>

            <Form onSubmit={handleSubmit}>
              {activeTab === 'signup' && (
                <InputGroup>
                  <Label htmlFor="name">Name</Label>
                  <InputContainer>
                    <Icon>
                      <FiUser size={16} />
                    </Icon>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      hasIcon
                      required
                    />
                  </InputContainer>
                </InputGroup>
              )}

              <InputGroup>
                <Label htmlFor="email">Email</Label>
                <InputContainer>
                  <Icon>
                    <FiMail size={16} />
                  </Icon>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    hasIcon
                    required
                  />
                </InputContainer>
              </InputGroup>

              <InputGroup>
                <Label htmlFor="password">Password</Label>
                <InputContainer>
                  <Icon>
                    <FiLock size={16} />
                  </Icon>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    hasIcon
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </PasswordToggle>
                </InputContainer>
              </InputGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Please wait...' : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
              </SubmitButton>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
