import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiX, FiUpload, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
    border-color: #6B8E6F;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const FormCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #6B8E6F;
    box-shadow: 0 0 0 3px rgba(107, 142, 111, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #6B8E6F;
    box-shadow: 0 0 0 3px rgba(107, 142, 111, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #6B8E6F;
    box-shadow: 0 0 0 3px rgba(107, 142, 111, 0.1);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.primary ? `
    background: #2D3E2D;
    color: white;
    
    &:hover {
      background: #1F2A1F;
      transform: translateY(-1px);
    }
  ` : `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
      border-color: #6B8E6F;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const ImageUploadContainer = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
  
  &:hover {
    border-color: #6B8E6F;
    background: #f0fdf4;
  }
  
  ${props => props.hasImage && `
    border-style: solid;
    border-color: #6B8E6F;
    background: white;
    padding: 1rem;
  `}
`;

const ImagePreview = styled.div`
  width: 100%;
  max-width: 300px;
  height: 200px;
  margin: 0 auto;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageUploadIcon = styled.div`
  font-size: 3rem;
  color: #6B8E6F;
  margin-bottom: 1rem;
`;

const ImageUploadText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const ImageUploadHint = styled.p`
  color: #9ca3af;
  font-size: 0.75rem;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const PreviewCard = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 2px dashed #d1d5db;
`;

const PreviewTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
`;

const PreviewPlantCard = styled.div`
  background: #6B8E6F;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 300px;
  margin: 0 auto;
`;

const PreviewImage = styled.div`
  width: 100%;
  height: 180px;
  background: #D3D3D3;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const PreviewName = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const PreviewSpecies = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
`;

const PreviewProgress = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const PreviewProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 999px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: 75%;
    height: 100%;
    background: #10B981;
    border-radius: 999px;
  }
`;

const PLANT_SPECIES = [
  { value: 'snake-plant', label: 'Snake Plant (Sansevieria)', care: 'Low maintenance, drought tolerant' },
  { value: 'fiddle-leaf-fig', label: 'Fiddle Leaf Fig (Ficus lyrata)', care: 'Bright light, consistent watering' },
  { value: 'monstera', label: 'Monstera Deliciosa', care: 'Climbing plant, high humidity' },
  { value: 'pothos', label: 'Pothos (Epipremnum)', care: 'Easy care, trailing plant' },
  { value: 'succulent', label: 'Succulent', care: 'Minimal watering, bright light' },
  { value: 'peace-lily', label: 'Peace Lily (Spathiphyllum)', care: 'Low light tolerant, moisture loving' },
  { value: 'spider-plant', label: 'Spider Plant', care: 'Easy propagation, adaptable' },
  { value: 'aloe-vera', label: 'Aloe Vera', care: 'Medicinal, drought tolerant' },
  { value: 'rubber-plant', label: 'Rubber Plant (Ficus elastica)', care: 'Glossy leaves, moderate care' },
  { value: 'zz-plant', label: 'ZZ Plant', care: 'Extremely low maintenance' }
];

const AddPlant = ({ onPlantAdd }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    notes: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = React.useRef(null);

  // Redirect to My Plants if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to add plants');
      navigate('/my-plants');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a plant name');
      return;
    }
    
    if (!formData.species) {
      toast.error('Please select a plant species');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for multipart/form-data upload
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('species', formData.species);
      submitData.append('notes', formData.notes || '');
      
      // Add image if present
      if (imageFile) {
        submitData.append('image', imageFile);
      }
      
      // Debug logging
      console.log('Submitting plant data:');
      console.log('- Name:', formData.name.trim());
      console.log('- Species:', formData.species);
      console.log('- Notes:', formData.notes || '(empty)');
      console.log('- Image:', imageFile ? imageFile.name : 'No image');
      
      const response = await fetch('/api/plant-data', {
        method: 'POST',
        body: submitData
        // Note: Don't set Content-Type header - browser will set it with boundary
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Failed to create plant');
      }
      
      const result = await response.json();
      console.log('Plant created successfully:', result);
      
      // Add the new plant to the app state if callback is provided
      if (onPlantAdd && result.plant) {
        onPlantAdd(result.plant);
      }
      
      toast.success(`${formData.name} added successfully! 🌱`);
      
      // Reload the page to refresh the plant list
      setTimeout(() => {
        window.location.href = '/my-plants';
      }, 1000);
      
    } catch (error) {
      console.error('Error adding plant:', error);
      console.error('Error details:', error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/my-plants');
  };

  const selectedSpeciesData = PLANT_SPECIES.find(s => s.value === formData.species);

  return (
    <Container>
      <Header>
        <BackButton onClick={handleCancel}>
          <FiArrowLeft />
        </BackButton>
        <Title>Add New Plant</Title>
      </Header>

      <FormCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Plant Name *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., My Snake Plant, Bedroom Monstera"
              required
            />
            <HelpText>Give your plant a unique name to identify it</HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="species">Plant Species *</Label>
            <Select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              required
            >
              <option value="">Select a species...</option>
              {PLANT_SPECIES.map(species => (
                <option key={species.value} value={species.value}>
                  {species.label}
                </option>
              ))}
            </Select>
            {selectedSpeciesData && (
              <HelpText>💡 {selectedSpeciesData.care}</HelpText>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="image">Plant Image (Optional)</Label>
            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
            <ImageUploadContainer 
              onClick={handleImageUploadClick}
              hasImage={imagePreview}
            >
              {imagePreview ? (
                <ImagePreview>
                  <img src={imagePreview} alt="Plant preview" />
                  <RemoveImageButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                  >
                    <FiX />
                  </RemoveImageButton>
                </ImagePreview>
              ) : (
                <>
                  <ImageUploadIcon>
                    <FiImage />
                  </ImageUploadIcon>
                  <ImageUploadText>
                    <FiUpload style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Click to upload plant image
                  </ImageUploadText>
                  <ImageUploadHint>
                    JPG, PNG, or GIF (max 5MB)
                  </ImageUploadHint>
                </>
              )}
            </ImageUploadContainer>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="notes">Care Notes (Optional)</Label>
            <TextArea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any special notes about your plant's care routine, location, or health observations..."
            />
          </FormGroup>

          {formData.name && formData.species && (
            <PreviewCard>
              <PreviewTitle>Card Preview</PreviewTitle>
              <PreviewPlantCard>
                {imagePreview ? (
                  <PreviewImage>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </PreviewImage>
                ) : (
                  <PreviewImage>No image selected</PreviewImage>
                )}
                <PreviewName>{formData.name || 'Plant Name'}</PreviewName>
                <PreviewSpecies>
                  {PLANT_SPECIES.find(s => s.value === formData.species)?.label || 'Species'}
                </PreviewSpecies>
                <PreviewProgress>Overall</PreviewProgress>
                <PreviewProgressBar />
              </PreviewPlantCard>
            </PreviewCard>
          )}

          <ButtonGroup>
            <Button type="button" onClick={handleCancel} disabled={loading}>
              <FiX />
              Cancel
            </Button>
            <Button type="submit" primary disabled={loading}>
              <FiCheck />
              {loading ? 'Adding Plant...' : 'Add Plant'}
            </Button>
          </ButtonGroup>
        </form>
      </FormCard>
    </Container>
  );
};

export default AddPlant;

