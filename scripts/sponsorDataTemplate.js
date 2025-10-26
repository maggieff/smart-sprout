/**
 * Template for adding sponsor data to Chroma DB
 * Replace the example data with your actual sponsor data
 */

// Example sponsor data structure
const sponsorDataTemplate = [
  {
    id: 'sponsor-001',
    species: 'Snake Plant',
    category: 'sponsor_product',
    text: 'Your sponsor product recommendation or tip here...',
    sponsor: 'Your Sponsor Name'
  },
  {
    id: 'sponsor-002',
    species: 'Fiddle Leaf Fig', 
    category: 'sponsor_tips',
    text: 'Your sponsor care tip here...',
    sponsor: 'Your Sponsor Name'
  }
  // Add more sponsor data items here...
];

// Categories you can use:
const categories = [
  'sponsor_product',    // Product recommendations
  'sponsor_tips',      // Care tips and advice
  'sponsor_equipment',  // Equipment suggestions
  'sponsor_troubleshooting', // Problem solving
  'sponsor_watering',   // Watering advice
  'sponsor_lighting',   // Lighting recommendations
  'sponsor_fertilizer'  // Fertilizer advice
];

module.exports = { sponsorDataTemplate, categories };
