const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { analyzePlantImage } = require('../utils/imageAnalysis');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    console.log('📁 File upload:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      extname: path.extname(file.originalname),
      extnameValid: extname,
      mimetypeValid: mimetype
    });
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      console.log('❌ File rejected:', file.originalname, file.mimetype);
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// In-memory storage for demo purposes
let photoStorage = [];

// POST /api/upload - Upload and analyze plant photo
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No photo uploaded' 
      });
    }

    const { plantId, description } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    
    console.log('📸 Photo uploaded:', fileName);
    console.log('🌱 Plant ID:', plantId);

    // Analyze the plant image (simulated for demo)
    const analysis = await analyzePlantImage(filePath, plantId);
    
    const photoRecord = {
      id: uuidv4(),
      plantId: plantId || 'unknown',
      fileName: fileName,
      originalName: req.file.originalname,
      filePath: filePath,
      url: `/uploads/${fileName}`,
      description: description || '',
      analysis: analysis,
      uploadedAt: new Date().toISOString(),
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    };

    photoStorage.push(photoRecord);
    
    // Sort by upload date (newest first)
    photoStorage.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({
      success: true,
      photo: photoRecord,
      message: 'Photo uploaded and analyzed successfully'
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    
    // Clean up file if upload failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to upload photo',
      details: error.message 
    });
  }
});

// GET /api/upload/photos - Get photos for a specific plant
router.get('/photos', async (req, res) => {
  try {
    const { plantId, limit = 20 } = req.query;
    
    if (!plantId) {
      return res.status(400).json({ 
        error: 'Plant ID is required' 
      });
    }

    let filteredPhotos = photoStorage.filter(photo => photo.plantId === plantId);
    
    // Limit results
    filteredPhotos = filteredPhotos.slice(0, parseInt(limit));
    
    res.json({
      photos: filteredPhotos,
      count: filteredPhotos.length,
      plantId
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// GET /api/upload/analysis/:photoId - Get detailed analysis for a photo
router.get('/analysis/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const photo = photoStorage.find(p => p.id === photoId);
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.json({
      photo,
      analysis: photo.analysis,
      recommendations: generatePhotoRecommendations(photo.analysis)
    });
  } catch (error) {
    console.error('Error fetching photo analysis:', error);
    res.status(500).json({ error: 'Failed to fetch photo analysis' });
  }
});

// DELETE /api/upload/:photoId - Delete a photo
router.delete('/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    const photoIndex = photoStorage.findIndex(photo => photo.id === photoId);
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photo = photoStorage[photoIndex];
    
    // Delete file from filesystem
    try {
      if (fs.existsSync(photo.filePath)) {
        fs.unlinkSync(photo.filePath);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }
    
    // Remove from storage
    const deletedPhoto = photoStorage.splice(photoIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Photo deleted successfully',
      deletedPhoto
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Helper functions
function generatePhotoRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.healthScore < 0.6) {
    recommendations.push('🔍 Consider checking soil moisture and lighting conditions');
  }
  
  if (analysis.issues && analysis.issues.length > 0) {
    analysis.issues.forEach(issue => {
      if (issue.type === 'yellow_leaves') {
        recommendations.push('💧 Yellow leaves may indicate overwatering - check soil moisture');
      } else if (issue.type === 'brown_tips') {
        recommendations.push('💨 Brown tips suggest low humidity - try misting or a humidifier');
      } else if (issue.type === 'wilting') {
        recommendations.push('💧 Plant appears to need water - check soil and water if dry');
      }
    });
  }
  
  if (analysis.growthStage === 'mature' && analysis.healthScore > 0.8) {
    recommendations.push('🌱 Plant looks healthy! Consider propagation or repotting if needed');
  }
  
  return recommendations;
}

module.exports = router;
