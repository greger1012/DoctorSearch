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

5. **Seed with sample data**
   ```bash
   npm run seed
   ```
   
   **Important**: This generates 100 sample/fake doctors using Faker.js for testing. 
   For production use with real doctor data:
   - Place your doctor CSV file in the project root
   - Run: `node server/scripts/importDoctorsCSV.js`
   - The CSV should have columns: NPI, Name, Specialty, Location, etc.

6. **Configure environment variables** (optional - for AI summaries)
   ```bash
   # Copy the example config file
   cp server/config.env.example server/config.env
   
   # Edit server/config.env and add your API keys
   # Without this, the app will use template-based summaries (still works!)
   # Get free Groq API key: https://console.groq.com/keys
   ```

7. **Start the development servers**
   ```bash
   npm run dev
   ```

## What's Included vs. What Needs Setup

### ✅ Included and Ready to Use:
- **1,884+ disease/condition databases** - All medical conditions and procedures are included
- **Search functionality** - Natural language search works immediately
- **Template-based AI summaries** - Works without API keys (basic summaries)
- **Sample doctor data** - Generates 100 fake doctors for testing

### ⚠️ Optional Setup:
- **LLM-powered summaries** - Requires API key in `server/config.env` (free Groq tier available)
- **Real doctor data** - Import your own CSV file using `importDoctorsCSV.js`

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

### Importing Real Doctor Data

By default, the app uses sample/fake doctor data generated by `seedData.js`. To import real doctor data:

1. **Prepare your CSV file**: Place your doctor CSV file in the project root directory
   - Required columns: NPI (National Provider Identifier), Name, Specialty, Location
   - Optional columns: Phone, Email, Languages, etc.
   - See `server/scripts/importDoctorsCSV.js` for the expected format

2. **Run the import script**:
   ```bash
   node server/scripts/importDoctorsCSV.js
   ```

3. **Verify the import**: Check Elasticsearch indices or use the search interface

**Note**: The CSV file is excluded from git (via `.gitignore`) to protect sensitive data.

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
