import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiX, FiCalendar, FiDroplet, FiSun, FiThermometer, FiWind } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { plantService } from '../services/plantService';

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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-family: 'Cubano', 'Karla', sans-serif;
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: 'Karla', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: 'Karla', sans-serif;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: 'Karla', sans-serif;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const DateInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: 'Karla', sans-serif;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SensorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SensorLabel = styled.label`
  font-family: 'Karla', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SensorInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: 'Karla', sans-serif;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Karla', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.primary ? `
    background: #10B981;
    color: white;
    
    &:hover {
      background: #059669;
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    
    &:hover {
      background: #e5e7eb;
    }
  `}
`;

const PlantEditModal = ({ 
  isOpen, 
  onClose, 
  plantData, 
  onSave, 
  title = "Edit Plant Details" 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    description: '',
    lastWatered: '',
    healthScore: 0.8,
    moisture: 50,
    light: 400,
    temperature: 72,
    humidity: 50
  });

  useEffect(() => {
    if (plantData) {
      setFormData({
        name: plantData.name || '',
        species: plantData.species || '',
        description: plantData.description || '',
        lastWatered: plantData.lastWatered ? 
          new Date(plantData.lastWatered).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        healthScore: plantData.healthScore || 0.8,
        moisture: plantData.sensorData?.moisture || 50,
        light: plantData.sensorData?.light || 400,
        temperature: plantData.sensorData?.temperature || 72,
        humidity: plantData.sensorData?.humidity || 50
      });
    }
  }, [plantData]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Plant name is required');
      return;
    }

    if (!formData.species.trim()) {
      toast.error('Plant species is required');
      return;
    }

    try {
      const newPlantData = {
        name: formData.name.trim(),
        species: formData.species.trim(),
        image: plantData?.image || null
      };

      let savedPlant;
      if (plantData?.id && plantData.id.startsWith('plant-')) {
        // This is a new plant, create it in the database
        const response = await plantService.createPlant(newPlantData);
        savedPlant = response.plant;
        toast.success('Plant added successfully!');
      } else {
        // This is an existing plant, update it
        const response = await plantService.updatePlant(plantData.id, newPlantData);
        savedPlant = { ...plantData, ...newPlantData };
        toast.success('Plant updated successfully!');
      }

      // Call the onSave callback with the saved plant
      onSave(savedPlant);
      onClose();
    } catch (error) {
      console.error('Error saving plant:', error);
      toast.error('Failed to save plant. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Plant Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter plant name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="species">Species *</Label>
            <Input
              id="species"
              name="species"
              type="text"
              value={formData.species}
              onChange={handleInputChange}
              placeholder="Enter plant species"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter plant description (optional)"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="lastWatered">Last Watered</Label>
            <DateInput
              id="lastWatered"
              name="lastWatered"
              type="date"
              value={formData.lastWatered}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="healthScore">Health Score (%)</Label>
            <Input
              id="healthScore"
              name="healthScore"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={formData.healthScore}
              readOnly
              style={{
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                cursor: 'not-allowed'
              }}
            />
          </FormGroup>

          <div>
            <Label>Sensor Data</Label>
            <SensorGrid>
              <SensorGroup>
                <SensorLabel>
                  <FiDroplet />
                  Moisture (%)
                </SensorLabel>
                <SensorInput
                  name="moisture"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.moisture}
                  onChange={handleInputChange}
                />
              </SensorGroup>

              <SensorGroup>
                <SensorLabel>
                  <FiSun />
                  Light (lux)
                </SensorLabel>
                <SensorInput
                  name="light"
                  type="number"
                  min="5000"
                  max="80000"
                  value={formData.light}
                  onChange={handleInputChange}
                />
              </SensorGroup>

              <SensorGroup>
                <SensorLabel>
                  <FiThermometer />
                  Temperature (°F)
                </SensorLabel>
                <SensorInput
                  name="temperature"
                  type="number"
                  min="0"
                  value={formData.temperature}
                  onChange={handleInputChange}
                />
              </SensorGroup>

              <SensorGroup>
                <SensorLabel>
                  <FiWind />
                  Humidity (%)
                </SensorLabel>
                <SensorInput
                  name="humidity"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.humidity}
                  onChange={handleInputChange}
                />
              </SensorGroup>
            </SensorGrid>
          </div>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" primary>
              Save Plant
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PlantEditModal;
