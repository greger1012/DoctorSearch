# Specialty Connections Implementation

This document explains how specialty connections from the Services tab are implemented in the search functionality.

## Data Structure

From the Services tab in `Greg Specifics.xlsx`, each service has:

- **Medical Services Name (Sitecore)**: The name of the medical service
- **Primary Specialty 1 & 2**: Main specialty connections (highest priority)
- **Related Specialty 1-6**: Subspecialty/related specialty connections (secondary priority)

## How It's Stored

When services are imported, they are stored in Elasticsearch with three specialty fields:

1. **`primarySpecialties`**: Array containing Primary Specialty 1 & 2
   - These represent the main specialty connections
   - Higher search priority (boost 4-5)

2. **`relatedSpecialties`**: Array containing Related Specialty 1-6
   - These represent subspecialty/related connections
   - Secondary search priority (boost 2-3)

3. **`specialties`**: Combined array of all specialties
   - Includes both primary and related specialties
   - Used for general search (boost 3)

## Search Implementation

### Content Query (Services)

The `buildContentQuery` function in `server/routes/search.js` implements specialty hierarchy:

1. **General Search**: Searches across all specialty fields with different boosts:
   - `primarySpecialties^4`: Higher boost for primary specialties
   - `relatedSpecialties^2`: Lower boost for related specialties
   - `specialties^3`: General specialty field

2. **Explicit Primary Specialty Search**: When a primary specialty is recognized:
   ```javascript
   {
     term: { 'primarySpecialties': { value: specialty, boost: 6 } }
   }
   ```

3. **Explicit Related Specialty Search**: When a related specialty is recognized:
   ```javascript
   {
     term: { 'relatedSpecialties': { value: specialty, boost: 4 } }
   }
   ```

4. **Specialty Filtering**: When filtering by specialty, checks all fields:
   - `primarySpecialties`
   - `relatedSpecialties`
   - `specialties`
   - `tags`

### Search Priority

The search prioritizes results based on specialty hierarchy:

- **Primary Specialty Match**: Highest score (boost 6)
- **Related Specialty Match**: Medium score (boost 4)
- **General Specialty Match**: Lower score (boost 3)

This ensures that services with the searched specialty as a primary connection rank higher than those with it as a related connection.

## Example

For the service "Advanced Heart Failure":
- **Primary Specialty**: Heart Failure
- **Related Specialties**: 
  - Heart Failure and Transplantation Cardiology
  - Mechanical Circulatory Support and Cardiothoracic Transplant
  - Cardiac Surgery
  - Interventional Cardiology

When searching for:
- **"Heart Failure"**: This service ranks high (primary specialty match)
- **"Cardiac Surgery"**: This service ranks medium (related specialty match)
- **"Cardiology"**: This service may appear if "Interventional Cardiology" matches

## Verification

Run `node server/scripts/testSpecialtySearch.js` to verify:
- Services are properly indexed with primary and related specialties
- Search correctly prioritizes primary over related specialties
- Both primary and related specialties are searchable

## Benefits

1. **Hierarchy Preservation**: Primary specialties maintain higher importance
2. **Comprehensive Search**: Services are findable by both primary and related specialties
3. **Relevance Ranking**: Results are ranked by specialty connection strength
4. **Flexible Matching**: Users can find services through various specialty paths

