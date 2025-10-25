const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo purposes
let logsStorage = [];

// POST /api/logs - Create a new plant care log
router.post('/', async (req, res) => {
  try {
    const { plantId, note, type = 'general', mood, photos } = req.body;
    
    if (!plantId || !note) {
      return res.status(400).json({ 
        error: 'Plant ID and note are required' 
      });
    }

    const newLog = {
      id: uuidv4(),
      plantId,
      note: note.trim(),
      type: type || 'general',
      mood: mood || 'neutral',
      photos: photos || [],
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    logsStorage.push(newLog);
    
    // Sort by timestamp (newest first)
    logsStorage.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(201).json({
      success: true,
      log: newLog,
      message: 'Log created successfully'
    });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// GET /api/logs - Get logs for a specific plant
router.get('/', async (req, res) => {
  try {
    const { plantId, limit = 10, type } = req.query;
    
    if (!plantId) {
      return res.status(400).json({ 
        error: 'Plant ID is required' 
      });
    }

    let filteredLogs = logsStorage.filter(log => log.plantId === plantId);
    
    if (type) {
      filteredLogs = filteredLogs.filter(log => log.type === type);
    }
    
    // Limit results
    filteredLogs = filteredLogs.slice(0, parseInt(limit));
    
    res.json({
      logs: filteredLogs,
      count: filteredLogs.length,
      plantId
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/logs/stats - Get logging statistics for a plant
router.get('/stats', async (req, res) => {
  try {
    const { plantId } = req.query;
    
    if (!plantId) {
      return res.status(400).json({ 
        error: 'Plant ID is required' 
      });
    }

    const plantLogs = logsStorage.filter(log => log.plantId === plantId);
    
    const stats = {
      totalLogs: plantLogs.length,
      logsThisWeek: plantLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= weekAgo;
      }).length,
      logsThisMonth: plantLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return logDate >= monthAgo;
      }).length,
      typeBreakdown: getTypeBreakdown(plantLogs),
      moodBreakdown: getMoodBreakdown(plantLogs),
      lastLogDate: plantLogs.length > 0 ? plantLogs[0].timestamp : null
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
});

// DELETE /api/logs/:logId - Delete a specific log
router.delete('/:logId', async (req, res) => {
  try {
    const { logId } = req.params;
    
    const logIndex = logsStorage.findIndex(log => log.id === logId);
    
    if (logIndex === -1) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    const deletedLog = logsStorage.splice(logIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Log deleted successfully',
      deletedLog
    });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

// Helper functions
function getTypeBreakdown(logs) {
  const breakdown = {};
  logs.forEach(log => {
    breakdown[log.type] = (breakdown[log.type] || 0) + 1;
  });
  return breakdown;
}

function getMoodBreakdown(logs) {
  const breakdown = {};
  logs.forEach(log => {
    breakdown[log.mood] = (breakdown[log.mood] || 0) + 1;
  });
  return breakdown;
}

module.exports = router;
