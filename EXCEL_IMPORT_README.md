# Excel Data Import Guide

This guide explains how to import the additional data from `Greg Specifics.xlsx` to enhance the search functionality.

## What Data is Being Imported?

The Excel file contains 11 sheets with valuable data:

1. **Services** (627 rows) - Medical services with specialty mappings
2. **ServiceProviders** (13,742 rows) - Links services to providers with NPI and scheduling DEPs
3. **ProviderDEPs** (2,697 rows) - Provider to DEP (Department) mappings for scheduling
4. **ServiceProviderDEPServices** (10,523 rows) - Service-provider-DEP relationships
5. **ServiceLocations** (118 rows) - Service to location mappings
6. **LocationCatalog** (621 rows) - Enhanced location details with SparkleIDs and Epic IDs
7. **LocationDEPDetails** (445 rows) - Location-DEP details
8. **DEPLinks** (1,294 rows) - Links between DEPs, locations, and providers
9. **PIVOT tables** - Aggregated views (used for reference)

## What Gets Enhanced?

### 1. Medical Services Search
- 627+ medical services are indexed and searchable
- Services include specialty mappings (primary and related)
- Services are linked to providers and locations via **NPI matching**
- Users can now search for services like "Heart Failure Treatment" or "Advanced Cardiology"

### 2. Doctor Profiles Enhanced (NPI-Based Linking)
- **Scheduling DEP IDs** - Added to doctor profiles for appointment booking integration
- **DEP Links** - Location-specific scheduling information
- **Services** - Doctors are linked to services they provide (via NPI matching)
- **Service Details** - Complete service information including specialties and DEPs
- All enhancements use **NPI as the primary key** to match doctors from CSV with providers in Excel

### 3. Location Data Enhanced
- **SparkleIDs** - Internal location identifiers
- **Epic IDs** - Epic system integration IDs
- **Taxonomy Specialties** - Medical specialty classifications
- **External IDs** - Integration with other systems

### 4. Search Improvements
- Services appear in search results alongside doctors and locations
- Specialty filtering works for services
- Better matching between queries and medical services

## How to Import

### Step 1: Update Index Mappings

First, update the Elasticsearch indices to support the new fields:

```bash
node server/scripts/updateIndicesForExcelData.js
```

This adds the necessary field mappings without recreating the indices.

### Step 2: Import Excel Data

Run the import script:

```bash
node server/scripts/importExcelData.js
```

This will:
1. Read all sheets from `Greg Specifics.xlsx`
2. Process and normalize the data
3. Update existing doctor documents with DEP information
4. Index new service documents
5. Index enhanced location documents
6. Refresh all indices

### Step 3: Verify Import

Check that the data was imported successfully:

```bash
# Check services count
curl "http://localhost:9200/content/_count?q=type:service"

# Check updated doctors
curl "http://localhost:9200/doctors/_count?q=schedulingDEPs:*"

# Check enhanced locations
curl "http://localhost:9200/locations/_count?q=sparkleId:*"
```

## Expected Results

After import, you should see:

- **Services indexed**: ~627 services in the `content` index
- **Doctors updated**: ~2,697 doctors with scheduling DEP IDs
- **Locations enhanced**: ~621 locations with SparkleIDs and Epic IDs
- **Service-provider relationships**: ~13,742 relationships mapped

## Search Examples

After import, users can search for:

1. **Medical Services**:
   - "Heart Failure Treatment"
   - "Advanced Cardiology Services"
   - "Neurology Services"

2. **Services by Specialty**:
   - "Cardiology services"
   - "Neurology programs"

3. **Services with Location**:
   - "Heart Failure services at Parnassus"

## Data Structure

### Service Document
```javascript
{
  type: 'service',
  name: 'Advanced Heart Failure Treatment',
  url: 'https://test.ucsfhealth.org/care/services/Advanced',
  specialties: ['Cardiology', 'Heart Failure'],
  primarySpecialties: ['Cardiology'],
  relatedSpecialties: ['Heart Failure'],
  locations: ['Parnassus', 'Mission Bay'],
  providers: ['1234567890', '0987654321'],
  providerNames: ['Dr. John Smith', 'Dr. Jane Doe']
}
```

### Enhanced Doctor Document
```javascript
{
  // ... existing doctor fields ...
  npi: '1699207217', // Used as primary key for matching
  schedulingDEPs: ['5201461', '5201470'],
  depLinks: [
    {
      dep: '5201470',
      sparkleId: '2445',
      locationName: 'Advanced Heart Failure Parnassus',
      address: '400 Parnassus Avenue',
      phone: '415-502-4243'
    }
  ],
  services: [
    {
      name: 'Advanced Heart Failure Treatment',
      url: 'https://test.ucsfhealth.org/care/services/Advanced',
      specialties: ['Cardiology', 'Heart Failure']
    }
  ],
  serviceUrls: ['https://test.ucsfhealth.org/care/services/Advanced'],
  serviceDetails: [
    {
      serviceUrl: 'https://test.ucsfhealth.org/care/services/Advanced',
      specialty: 'Heart Failure and Transplantation Cardiology',
      deps: ['5201461', '5201470'],
      providersMode: 'Dynamic'
    }
  ]
}
```

### Enhanced Location Document
```javascript
{
  // ... existing location fields ...
  sparkleId: '2445',
  cleanName: 'Advanced Heart Failure Parnassus',
  epicId: '5201470',
  taxonomySpecialties: ['Cardiology'],
  externalIds: 'Kyruus: LOC0000224904\nEpic: 5201470'
}
```

## Troubleshooting

### Error: "Excel file not found"
- Make sure `Greg Specifics.xlsx` is in the project root directory
- Check the file name matches exactly (case-sensitive)

### Error: "Index does not exist"
- Run `node server/scripts/setupIndices.js` first to create indices
- Then run `node server/scripts/updateIndicesForExcelData.js` to update mappings

### Error: "Field mapping conflict"
- If you get mapping conflicts, you may need to recreate the indices:
  ```bash
  # Delete and recreate (WARNING: This deletes all data!)
  # Only do this if you haven't imported doctor data yet
  curl -X DELETE "http://localhost:9200/content"
  curl -X DELETE "http://localhost:9200/locations"
  node server/scripts/setupIndices.js
  node server/scripts/importExcelData.js
  ```

### Import is slow
- The import processes ~35,000 rows across all sheets
- Large batches are processed in chunks of 500
- Expect the import to take 2-5 minutes depending on your system

## Re-importing

If you need to re-import:

1. The script will update existing doctor documents (won't duplicate)
2. Services will be re-indexed (may create duplicates - consider clearing content index first)
3. Enhanced locations will be re-indexed (may create duplicates)

To avoid duplicates, you can clear specific indices before re-importing:

```bash
# Clear only services (type:service) from content index
# This requires a more complex query - consider using Kibana Dev Tools
```

## Next Steps

After importing:

1. **Test the search** - Try searching for medical services
2. **Verify DEP IDs** - Check that doctors have scheduling DEP IDs
3. **Test service queries** - Search for services by name or specialty
4. **Integrate with scheduling** - Use DEP IDs for appointment booking integration

## Notes

- **NPI-Based Matching**: The import script uses NPI (National Provider Identifier) as the primary key to match doctors from `doctorsdata.CSV` with providers in `Greg Specifics.xlsx`
- All data is normalized and cleaned before indexing
- The script handles missing or null values gracefully
- DEP IDs can be used for integration with Epic or other scheduling systems
- SparkleIDs are internal UCSF location identifiers
- Services are linked to doctors via NPI matching from the ServiceProviders sheet
- Doctor documents are enriched with all services they provide, based on NPI matches

---

For questions or issues, check the import script logs or contact the development team.

