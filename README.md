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

## Quick Start

### Prerequisites

- Node.js 16+ 
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/greger1012/DoctorSearch.git
   cd DoctorSearch
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

   **Quick setup check**: After installing, run `npm run setup:check` to verify your setup.

3. **Start Elasticsearch and Kibana**
   ```bash
   npm run elasticsearch
   ```

4. **Set up Elasticsearch indices**
   ```bash
   node server/scripts/setupIndices.js
   ```

5. **Import doctor data** (recommended)
   ```bash
   node server/scripts/importDoctorsCSV.js
   ```
   
   **Note**: The `doctorsdata.CSV` file is included in the repository, so real doctor data will be imported automatically.
   If you prefer to use sample/fake data for testing, you can skip this step and run `npm run seed` instead.

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
- **Real doctor data** - `doctorsdata.CSV` is included and will be imported automatically
- **Search functionality** - Natural language search works immediately
- **Template-based AI summaries** - Works without API keys (basic summaries)

### ⚠️ Optional Setup:
- **LLM-powered summaries** - Requires your own API key in `server/config.env` (free Groq tier available)
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

1. Modify the seeding scripts in `server/scripts/seedData.js`
2. Update the index mappings in `server/scripts/setupIndices.js`
3. Re-run the seeding process

### Customizing Search

The search functionality can be customized by modifying:
- `server/routes/search.js` - Search logic and scoring
- `server/services/` - Business logic services
- `client/src/components/SearchBox.js` - Search UI and suggestions
- `client/src/components/SearchResults.js` - Results display

### Styling

The application uses Styled Components for styling. Global styles are defined in `client/src/styles/GlobalStyles.js`.

## Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set up production Elasticsearch cluster

3. Configure environment variables:
   ```bash
   ELASTICSEARCH_URL=https://your-elasticsearch-cluster
   NODE_ENV=production
   ```

4. Deploy the backend and serve the built frontend

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
