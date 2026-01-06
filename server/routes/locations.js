const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const router = express.Router();

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Get all locations with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      size = 20, 
      location, 
      services,
      search 
    } = req.query;

    const from = (page - 1) * size;
    
    const query = {
      bool: {
        must: [
          { term: { type: 'location' } }
        ]
      }
    };

    // Add search term if provided
    if (search) {
      query.bool.must.push({
        multi_match: {
          query: search,
          fields: ['name^3', 'address^2', 'description^2', 'services^1'],
          fuzziness: 'AUTO'
        }
      });
    }

    // Add filters
    if (location) {
      query.bool.filter = query.bool.filter || [];
      query.bool.filter.push({ term: { 'location.keyword': location } });
    }

    if (services) {
      query.bool.filter = query.bool.filter || [];
      query.bool.filter.push({ terms: { 'services.keyword': services.split(',') } });
    }

    const response = await client.search({
      index: 'locations',
      body: {
        query,
        from,
        size: parseInt(size),
        sort: [{ '_score': { order: 'desc' } }, { 'name.keyword': { order: 'asc' } }]
      }
    });

    res.json({
      locations: response.body?.hits?.hits?.map(hit => hit._source) || [],
      total: response.body?.hits?.total?.value || 0,
      page: parseInt(page),
      size: parseInt(size)
    });

  } catch (error) {
    console.error('Locations search error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get all available locations for filter dropdown (using Location Name (Clean) from LocationCatalog)
router.get('/list', async (req, res) => {
  try {
    // Get all locations from the index, prioritizing LocationCatalog data
    const response = await client.search({
      index: 'locations',
      body: {
        query: {
          bool: {
            should: [
              // Prefer locations from LocationCatalog
              { term: { fromLocationCatalog: true } },
              // Also include other locations
              { term: { type: 'location' } }
            ],
            minimum_should_match: 1
          }
        },
        _source: ['name', 'cleanName', 'fromLocationCatalog'],
        size: 1000
      }
    });

    const hits = response.body?.hits?.hits || response.hits?.hits || [];
    const locationSet = new Set();
    
    // Use cleanName from LocationCatalog (this matches what's in the Excel sheet)
    hits.forEach(hit => {
      const source = hit._source;
      // Prefer cleanName (from LocationCatalog) over name
      const locationName = source.cleanName || source.name || '';
      
      if (locationName && locationName.trim()) {
        // Use the exact name from LocationCatalog - these are the real location names
        locationSet.add(locationName.trim());
      }
    });
    
    // Fallback: if we don't have LocationCatalog data yet, use common UCSF locations
    if (locationSet.size === 0) {
      const defaultLocations = [
        'Parnassus Heights',
        'Mission Bay',
        'Mount Zion',
        'Oakland',
        'San Francisco General',
        'UCSF Medical Center',
        'UCSF Medical Group',
        "Benioff Children's Hospital"
      ];
      defaultLocations.forEach(loc => locationSet.add(loc));
    }
    
    const locations = Array.from(locationSet)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    res.json(locations);
  } catch (error) {
    console.error('Locations list fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get location by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await client.get({
      index: 'locations',
      id: id
    });

    res.json(response.body?._source || {});
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({ error: 'Location not found' });
    } else {
      console.error('Location fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch location' });
    }
  }
});

// Get available services
router.get('/services/list', async (req, res) => {
  try {
    const response = await client.search({
      index: 'locations',
      body: {
        aggs: {
          services: {
            terms: {
              field: 'services.keyword',
              size: 100
            }
          }
        },
        size: 0
      }
    });

    const services = response.body.aggregations?.services?.buckets?.map(
      bucket => bucket.key
    ) || [];

    res.json(services);
  } catch (error) {
    console.error('Services fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

module.exports = router;
