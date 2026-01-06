# DoctorSearch

A modern, AI-powered unified search solution for UCSF Health that combines doctor search, location search, and content search into a single, intelligent interface. The app receives a prompt and finds the best doctor for your needs based on that prompt.

## Features

- **Unified Search**: Single search box that finds doctors, locations, and health information
- **AI-Powered**: Intelligent query processing with LLM-powered summaries and auto-complete
- **Modern UI**: Beautiful, responsive interface built with React
- **Elasticsearch Backend**: Powerful search engine with advanced filtering and aggregations
- **Real-time Results**: Fast, relevant search results with highlighting
- **Filtering**: Advanced filters for specialty, location, and patient acceptance
- **Detailed Views**: Comprehensive doctor and location detail pages

## Technology Stack

- **Frontend**: React 18, Styled Components, Lucide React Icons
- **Backend**: Node.js, Express.js
- **Search Engine**: Elasticsearch 8.11 with Kibana
- **AI Summaries**: Groq/OpenAI/Hugging Face LLM integration
- **Data**: JSON-based with comprehensive disease database

## Quick Start (Local Setup)

### Prerequisites

- **Node.js 16+** - Download from [nodejs.org](https://nodejs.org/)
- **Docker Desktop** - Download from [docker.com](https://www.docker.com/products/docker-desktop)
- **Git** (optional, for cloning) - Or just download ZIP from GitHub

### Simple Setup Steps

1. **Get the code**
   - **Option A**: Download ZIP from GitHub and extract it
   - **Option B**: `git clone https://github.com/greger1012/DoctorSearch.git`
   - Open terminal in the project folder

2. **Install everything** (one command):
   ```bash
   npm run setup
   ```
   This installs all dependencies. Takes 2-3 minutes.

3. **Start Elasticsearch** (in one terminal):
   ```bash
   npm run elasticsearch
   ```
   Wait 30 seconds for it to start. Keep this terminal open.

4. **Import your data** (in a new terminal):
   ```bash
   npm run startup
   npm run import:excel
   npm run import:locations
   ```
   This imports all doctors, services, and locations. Takes 5-10 minutes total.

5. **Start the app**:
   ```bash
   npm run dev
   ```
   Opens automatically at http://localhost:3000

**That's it!** Your app is now running locally.

### Next Time (After First Setup)

Just run:
```bash
npm run elasticsearch    # In one terminal
npm run dev              # In another terminal
```

**See [SIMPLE_SETUP.md](./SIMPLE_SETUP.md) for detailed step-by-step instructions.**

4. **Set up Elasticsearch indices**
   ```bash
   node server/scripts/setupIndices.js
   ```

5. **Import doctor data** (required)
   ```bash
   node server/scripts/importDoctorsCSV.js
   ```
   
   **Important**: The `doctorsdata.CSV` file is included in the repository. This imports real doctor data.
   The app will not work properly without doctor data.
   
   **For testing only**: If you need fake/test data for development, you can run `npm run seed:fake` 
   (but this should never be used in production).

6. **Configure environment variables** (optional - for AI summaries)
   ```bash
   # Copy the example config file
   cp server/config.env.example server/config.env
   
   # Edit server/config.env and add YOUR OWN API key
   # Each user needs their own Groq API key (free tier available)
   # Without this, the app will use template-based summaries (still works!)
   # Get free Groq API key: https://console.groq.com/keys
   ```
   
   **Important**: You need to get your own Groq API key - the app doesn't include one for security reasons.
   The AI summaries will work exactly the same way with your own key. It's free and takes 2 minutes to set up.

7. **Start the development servers**
   ```bash
   npm run dev
   ```

## What's Included vs. What Needs Setup

### ✅ Included and Ready to Use:
- **1,884+ disease/condition databases** - All medical conditions and procedures are included
- **Real doctor data** - `doctorsdata.CSV` is included (import with `importDoctorsCSV.js`)
- **Search functionality** - Natural language search works immediately
- **Template-based AI summaries** - Works without API keys (basic summaries)

### ⚠️ Important Notes:
- **No fake data by default** - The app only uses real data from `doctorsdata.CSV`. 
  Fake/test data is only generated if you explicitly run `npm run seed:fake` (for testing only).
- **LLM-powered summaries** - Optional, requires your own API key in `server/config.env` (free Groq tier available)
  - Each user needs their own Groq API key (for security and rate limiting)
  - Get a free key: https://console.groq.com/keys
  - Works exactly the same way - just uses your own key instead

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200

## Project Structure

```
DoctorSearch/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # Global styles
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── scripts/           # Setup and seeding scripts
│   └── index.js           # Server entry point
└── package.json           # Root package.json
```

## API Endpoints

### Search
- `POST /api/search` - Unified search across all content types
- `GET /api/search/suggest/:query` - Get search suggestions

### Doctors
- `GET /api/doctors` - List doctors with filtering
- `GET /api/doctors/:id` - Get doctor details
- `GET /api/doctors/specialties/list` - Get available specialties

### Locations
- `GET /api/locations` - List locations with filtering
- `GET /api/locations/:id` - Get location details
- `GET /api/locations/services/list` - Get available services

## Example Queries

The unified search supports natural language queries like:

- "UCSF neurologists at Parnassus who see new patients this month"
- "Cardiologists accepting new patients"
- "Emergency care Mission Bay"
- "Parkinson's disease specialists"
- "Pediatric specialists"

## Elasticsearch Indices

The system uses three main indices:

1. **doctors** - Doctor profiles with specialties, locations, and availability
2. **locations** - UCSF facilities with services and contact information
3. **content** - Health articles, research, and educational content

## Development

### Importing Doctor Data

The repository includes `doctorsdata.CSV` with real doctor data. To import it:

1. **Run the import script**:
   ```bash
   node server/scripts/importDoctorsCSV.js
   ```

2. **Verify the import**: Check Elasticsearch indices or use the search interface

**Note**: If you want to use your own CSV file instead, place it in the project root and run the same command.
The script will automatically detect and use any CSV file in the root directory.

### Adding New Data

**For Real Doctor Data:**
1. Update your CSV file (`doctorsdata.CSV` or your own CSV)
2. Run: `node server/scripts/importDoctorsCSV.js`

**For Fake/Test Data (testing only):**
1. Modify the fake data generation in `server/scripts/seedData.js`
2. Run: `npm run seed:fake`
3. ⚠️ Remember: This generates FAKE data and should never be used in production

**Updating Index Mappings:**
1. Modify the index mappings in `server/scripts/setupIndices.js`
2. Re-run: `node server/scripts/setupIndices.js`

### Customizing Search

The search functionality can be customized by modifying:
- `server/routes/search.js` - Search logic and scoring
- `server/services/` - Business logic services
- `client/src/components/SearchBox.js` - Search UI and suggestions
- `client/src/components/SearchResults.js` - Results display

### Styling

The application uses Styled Components for styling. Global styles are defined in `client/src/styles/GlobalStyles.js`.

## Production Deployment

Want to deploy this app so your client can access it with one click? See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick Deploy Options:**
- **Railway** (Recommended): One-click deployment with GitHub integration
- **Render**: Similar to Railway, great for demos  
- **Vercel + Backend**: Split frontend/backend deployment

All deployment options support:
- ✅ Automatic builds from GitHub
- ✅ Environment variable configuration
- ✅ Production-ready setup
- ✅ All your data included

### Manual Deployment Steps

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set up production Elasticsearch cluster (or use managed service)

3. Configure environment variables:
   ```bash
   ELASTICSEARCH_URL=https://your-elasticsearch-cluster
   NODE_ENV=production
   ```

4. Deploy the backend and serve the built frontend

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please create an issue in the repository or contact the development team.
