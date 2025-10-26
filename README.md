# Smart Plant Tracker 🌱

A hackathon-ready web application for tracking plant health with AI-powered recommendations, simulated sensors, and gamified progress tracking.

## 🚀 Quick Start (36-Hour Hackathon Setup)
### Prerequisites
- Node.js (v16+)
- npm or yarn
- Docker (for Chroma DB)
- OpenAI API key (optional - has fallback responses)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd smart-sprout
```

### 2. One-Command Demo Setup
```bash
# Start everything with one command
node scripts/startDemo.js
```

### 3. Manual Setup (Alternative)
```bash
# Terminal 1: Start Chroma DB
docker run -p 8000:8000 chromadb/chroma

# Terminal 2: Setup and start backend
cd backend
npm install
cp env.example .env
# Add your OpenAI API key to .env (optional)
npm start

# Terminal 3: Setup and start frontend
cd frontend
npm install
npm start
```

### 4. Initialize Knowledge Base
```bash
# Generate embeddings for AI knowledge base
node scripts/generateEmbeddings.js
```

## 🏗️ Project Structure

```
smart-sprout/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   └── utils/          # Helper functions
│   └── public/             # Static assets
├── backend/                 # Node.js/Express API
│   ├── routes/             # API endpoints
│   ├── utils/              # Chroma DB, sensors, AI
│   └── data/               # Plant care dataset
├── scripts/                # Setup and utility scripts
└── data/                   # Sample plant data
```

## 🎯 Demo Flow (For Judges)

### 1. Dashboard View
- Show plant with live sensor data (moisture, light, temperature, humidity)
- Dynamic health progress bar
- Real-time sensor readings with status indicators

### 2. AI Assistant Demo
- Ask: "Should I water my Snake Plant today?"
- Ask: "Why are my leaves turning yellow?"
- Ask: "What's the best lighting for my plant?"
- Show context-aware responses based on sensor data

### 3. Interactive Features
- Add daily log entries
- Upload plant photos (optional)
- View sensor history charts
- Quick action buttons (water, fertilize, etc.)

### 4. Health Tracking
- Gamified progress bar
- Health score calculation
- Care recommendations
- Status indicators

## 👥 Team Roles & Tasks

### Frontend Developer
- **Files**: `frontend/src/components/`, `frontend/src/services/`
- **Tasks**: UI components, API integration, responsive design
- **Key Components**: Dashboard, PlantCard, ProgressBar, AIChat

### Backend/AI Developer  
- **Files**: `backend/routes/`, `backend/utils/`
- **Tasks**: API endpoints, Chroma DB integration, OpenAI API
- **Key Files**: `askAI.js`, `chromaClient.js`, `aiAssistant.js`

### Data Lead
- **Files**: `backend/data/plantCareDataset.json`, `scripts/`
- **Tasks**: Plant care dataset, embeddings, knowledge base
- **Key Files**: Dataset, embedding generation, Chroma setup

### Designer/Tester
- **Files**: `frontend/src/index.css`, `frontend/src/components/`
- **Tasks**: UI polish, demo preparation, user testing
- **Focus**: Styling, animations, demo flow

## 🔧 Features

### ✅ Core Features
- **Real-time sensor simulation** - Moisture, light, temperature, humidity
- **AI-powered recommendations** - OpenAI + Chroma DB integration
- **Gamified health tracking** - Progress bars and health scores
- **Daily logging system** - Plant care notes and history
- **Modern responsive UI** - Mobile-friendly design
- **Photo upload** - Optional plant photo analysis

### ✅ Technical Features
- **Chroma DB integration** - Vector embeddings for plant care knowledge
- **Simulated sensors** - Realistic sensor data with drift and variation
- **Health calculation** - Multi-factor health scoring algorithm
- **API endpoints** - RESTful API with error handling
- **Real-time updates** - Live sensor data refresh

## 📊 API Endpoints

### Plant Data
- `GET /api/plant-data` - Live sensor data + health score
- `GET /api/plant-data/all` - All plants list
- `GET /api/plant-data/:id` - Specific plant details

### Logging
- `POST /api/logs` - Create plant care log
- `GET /api/logs` - Get plant logs
- `GET /api/logs/stats` - Log statistics

### AI Assistant
- `POST /api/ask-ai` - AI plant care recommendations
- `GET /api/ask-ai/suggestions` - Suggested questions

### Photo Upload
- `POST /api/upload` - Upload and analyze plant photo
- `GET /api/upload/photos` - Get plant photos

## 🌱 Supported Plants

The system includes care data for 10+ popular houseplants:

- **Snake Plant** - Low maintenance, drought tolerant
- **Fiddle Leaf Fig** - Bright indirect light, consistent watering
- **Monstera** - Climbing plant, high humidity
- **Pothos** - Easy care, trailing plant
- **Succulents** - Minimal watering, bright light
- **Peace Lily** - Low light tolerant, moisture loving
- **Spider Plant** - Easy propagation, adaptable
- **Aloe Vera** - Medicinal, drought tolerant
- **Rubber Plant** - Glossy leaves, moderate care
- **ZZ Plant** - Extremely low maintenance

## 🚀 Post-Hackathon Scaling

### Phase 1: Real Hardware Integration
- Replace simulated sensors with actual IoT devices
- Add real-time data streaming
- Implement sensor calibration

### Phase 2: User Management
- Add user authentication (Auth0/Firebase)
- Multi-user plant collections
- User preferences and settings

### Phase 3: Advanced Features
- Plant growth tracking over time
- Community features and plant sharing
- Advanced AI diagnostics
- Mobile app development

### Phase 4: Commercial Features
- Plant marketplace integration
- Subscription-based premium features
- Professional plant care services
- IoT device sales and support

## 🛠️ Development Commands

```bash
# Backend development
cd backend
npm run dev          # Start with nodemon
npm test            # Run tests
npm run setup       # Setup Chroma DB

# Frontend development  
cd frontend
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests

# Database setup
node scripts/setupChroma.js        # Initialize Chroma DB
node scripts/generateEmbeddings.js  # Generate embeddings
node scripts/startDemo.js           # Start full demo
```

## 🔧 Environment Variables

Create `backend/.env` from `backend/env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key_here

# Chroma DB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## 🐛 Troubleshooting

### Common Issues

1. **Chroma DB Connection Failed**
   ```bash
   docker run -p 8000:8000 chromadb/chroma
   ```

2. **Backend Won't Start**
   ```bash
   cd backend
   npm install
   cp env.example .env
   npm start
   ```

3. **Frontend Build Errors**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **AI Responses Not Working**
   - Check OpenAI API key in `.env`
   - System has fallback responses if API unavailable

### Demo Tips

- **For Judges**: Focus on the AI chat and sensor dashboard
- **For Demo**: Show the health progress bar and real-time updates
- **For Pitch**: Emphasize the AI-powered recommendations and scalability

## 📈 Success Metrics

### Hackathon Goals
- ✅ **Functional Demo** - All features working in 36 hours
- ✅ **AI Integration** - OpenAI + Chroma DB working
- ✅ **Modern UI** - Professional, responsive design
- ✅ **Scalable Architecture** - Ready for post-hackathon development

### Technical Achievements
- ✅ **Real-time Data** - Live sensor simulation
- ✅ **AI Knowledge Base** - 35+ plant care tips with embeddings
- ✅ **Health Scoring** - Multi-factor algorithm
- ✅ **API Design** - RESTful endpoints with error handling

---

**Ready to grow? Let's make plants smarter! 🌿**

*Built with ❤️ for the hackathon community*
