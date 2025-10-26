const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const database = require('../utils/database');
const { authenticateUser } = require('../middleware/auth');

// POST /api/logs - Create a new plant care log
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { plantId, note, type = 'general', mood, photos } = req.body;
    
    if (!plantId || !note) {
      return res.status(400).json({ 
        error: 'Plant ID and note are required' 
      });
    }

    // Verify the plant belongs to the user
    const plant = await database.getPlantById(plantId, req.user.id);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const logData = {
      id: uuidv4(),
      plantId,
      note: note.trim(),
      type: type || 'general',
      mood: mood || 'neutral',
      photos: photos || []
    };

    const result = await database.createLog(req.user.id, logData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        log: result.log,
        message: 'Log created successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to create log' });
    }
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// GET /api/logs - Get logs for a specific plant
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { plantId, limit = 10, type } = req.query;
    
    if (!plantId) {
      return res.status(400).json({ 
        error: 'Plant ID is required' 
      });
    }

    // Verify the plant belongs to the user
    const plant = await database.getPlantById(plantId, req.user.id);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const logs = await database.getUserLogs(req.user.id, plantId, parseInt(limit), type);
    
    res.json({
      logs,
      count: logs.length,
      plantId
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/logs/stats - Get logging statistics for a plant
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const { plantId } = req.query;
    
    if (!plantId) {
      return res.status(400).json({ 
        error: 'Plant ID is required' 
      });
    }

    // Verify the plant belongs to the user
    const plant = await database.getPlantById(plantId, req.user.id);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const stats = await database.getLogStats(req.user.id, plantId);

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
});

// DELETE /api/logs/:logId - Delete a specific log
router.delete('/:logId', authenticateUser, async (req, res) => {
  try {
    const { logId } = req.params;
    
    const result = await database.deleteLog(logId, req.user.id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Log deleted successfully'
      });
    } else {
      res.status(404).json({ error: 'Log not found' });
    }
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

// Helper functions (moved to database layer)

module.exports = router;
