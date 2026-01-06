# NPI-Based Data Linking Summary

## Overview

The import system now uses **NPI (National Provider Identifier)** as the primary key to connect data between:
- `doctorsdata.CSV` - Contains doctor data with NPI column
- `Greg Specifics.xlsx` - Contains provider data with Provider NPI columns

## How NPI Linking Works

### 1. Data Sources
- **CSV**: `NPI` column identifies each doctor
- **Excel**: `Provider NPI` columns in multiple sheets identify providers

### 2. Matching Process

The import script:
1. Reads all NPIs from the Excel file (ServiceProviders, ProviderDEPs, DEPLinks sheets)
2. Builds maps keyed by NPI:
   - `providerDEPMap`: NPI → [DEP IDs]
   - `depLinkMap`: NPI → [DEP Link objects]
   - `npiToServicesMap`: NPI → [Service URLs]
   - `npiToServiceDetailsMap`: NPI → [Service detail objects]
3. Matches existing doctors in Elasticsearch by NPI
4. Enriches doctor documents with all Excel data where NPIs match

### 3. What Gets Linked

#### Doctor Documents Enhanced:
- ✅ **Scheduling DEPs** - From ProviderDEPs sheet (matched by NPI)
- ✅ **DEP Links** - From DEPLinks sheet (matched by NPI)
- ✅ **Services** - From ServiceProviders sheet (matched by NPI)
- ✅ **Service Details** - Complete service information per doctor

#### Service Documents Enhanced:
- ✅ **Provider NPIs** - From ServiceProviders sheet (linked by NPI)
- ✅ **Provider Names** - Matched via NPI
- ✅ **Provider IDs** - Matched via NPI

## Benefits

1. **Accurate Matching**: NPI is a unique identifier, ensuring correct doctor-provider matching
2. **Complete Integration**: All Excel data is linked to the correct doctors
3. **Service Discovery**: Doctors can be found by the services they provide
4. **Scheduling Ready**: DEP IDs are correctly associated with the right doctors

## Example Flow

```
1. Doctor in CSV: NPI = "1699207217", Name = "Dr. John Smith"
2. Excel ServiceProviders sheet: Provider NPI = "1699207217", Service = "Heart Failure Treatment"
3. Excel ProviderDEPs sheet: Provider NPI = "1699207217", DEP = "5201470"
4. Excel DEPLinks sheet: Provider NPI = "1699207217", Location = "Parnassus"

Result: Dr. John Smith's document is enriched with:
- Service: Heart Failure Treatment
- DEP: 5201470
- Location: Parnassus
- All linked via NPI = "1699207217"
```

## Statistics

After import, you'll see:
- Number of NPIs matched between CSV and Excel
- Number of doctors enriched with service information
- Number of services linked to providers via NPI

## Verification

To verify NPI matching worked:
```bash
# Check doctors with services
curl "http://localhost:9200/doctors/_count?q=services:*"

# Check doctors with DEPs
curl "http://localhost:9200/doctors/_count?q=schedulingDEPs:*"

# Check a specific doctor by NPI
curl "http://localhost:9200/doctors/_search?q=npi:1699207217"
```

---

This NPI-based approach ensures accurate, reliable data integration between the two data sources.

