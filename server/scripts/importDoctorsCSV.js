const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Map UCSF locations from the data
const locationMapping = {
  PARN: 'Parnassus Heights',
  MZB: 'Mission Bay',
  MTZ: 'Mount Zion',
  OAK: 'Oakland',
  SFGH: 'San Francisco General',
  CHILD: "Benioff Children's Hospital",
  UCNAC: 'UCSF Medical Center',
  CFMG: 'UCSF Medical Group'
};

const BATCH_SIZE = 200;

// Clean and normalize data
function cleanString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

function parseDelimitedList(value) {
  if (!value) return [];
  return value
    .split(/[;,]/)
    .map(item => cleanString(item))
    .filter(Boolean);
}

function parseNewPatients(value) {
  if (!value) return false;
  return value.toLowerCase().includes('yes') || value.toLowerCase().includes('new patients');
}

function parseDate(dateString) {
  if (!dateString || dateString.trim() === '') return null;

  try {
    // Parse M/D/YYYY format
    const parts = dateString.trim().split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return null;
  } catch (error) {
    return null;
  }
}

function getExperienceYears(graduationDate, currentDate = new Date()) {
  if (!graduationDate) return null; // No fake data - return null if no graduation date

  try {
    const gradYear = new Date(graduationDate).getFullYear();
    const currentYear = currentDate.getFullYear();
    return Math.max(0, currentYear - gradYear);
  } catch (error) {
    return null; // Return null on error instead of fake data
  }
}

function toSlug(str) {
  return cleanString(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function summarizeLocation(entry) {
  const specialtySummary = entry.topSpecialties.length > 0
    ? `Specialties include ${entry.topSpecialties.map(spec => `${spec.name} (${spec.count})`).join(', ')}.`
    : '';
  const acceptingText =
    entry.doctorCount > 0
      ? `${entry.acceptingCount} of ${entry.doctorCount} physicians (${Math.round((entry.acceptingCount / entry.doctorCount) * 100)}%) are accepting new patients.`
      : '';
  const departmentText = entry.departments.length > 0
    ? `Departments represented: ${entry.departments.join(', ')}.`
    : '';

  return [
    `UCSF Health providers practicing at ${entry.name}${entry.city ? ` in ${entry.city}` : ''}.`,
    specialtySummary,
    acceptingText,
    departmentText
  ]
    .filter(Boolean)
    .join(' ');
}

function summarizeSpecialty(entry) {
  const acceptingText =
    entry.doctorCount > 0
      ? `${entry.acceptingCount} (${Math.round((entry.acceptingCount / entry.doctorCount) * 100)}%) are accepting new patients.`
      : 'Accepting new patient information is not available.';
  const locationsSummary = entry.topLocations.length
    ? `Primary practice locations: ${entry.topLocations.map(loc => `${loc.name} (${loc.count})`).join(', ')}.`
    : '';
  const languagesSummary = entry.languages.length
    ? `Common languages spoken include ${entry.languages.map(lang => `${lang.name} (${lang.count})`).join(', ')}.`
    : '';
  return [
    `We have ${entry.doctorCount} UCSF Health physicians focused on ${entry.specialty}.`,
    acceptingText,
    locationsSummary,
    languagesSummary
  ]
    .filter(Boolean)
    .join(' ');
}

function buildLocationDoc(key, rawEntry) {
  const topSpecialties = Array.from(rawEntry.specialties.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const entry = {
    name: rawEntry.name,
    location: rawEntry.location,
    locationCode: rawEntry.locationCode || null,
    address: rawEntry.address || null,
    city: rawEntry.city || null,
    state: rawEntry.state || null,
    zip: rawEntry.zip || null,
    phoneNumbers: Array.from(rawEntry.phoneNumbers).filter(Boolean),
    faxNumbers: Array.from(rawEntry.faxNumbers).filter(Boolean),
    departments: Array.from(rawEntry.departments).filter(Boolean),
    doctorCount: rawEntry.doctorCount,
    acceptingCount: rawEntry.acceptingCount,
    featuredDoctors: Array.from(rawEntry.sampleDoctors).slice(0, 6),
    topSpecialties,
    services: topSpecialties.slice(0, 6).map(item => item.name),
    summary: '',
    key
  };

  entry.summary = summarizeLocation(entry);

  return {
    type: 'location',
    name: entry.name,
    location: entry.location,
    locationCode: entry.locationCode,
    address: entry.address,
    city: entry.city,
    state: entry.state,
    zip: entry.zip,
    phone: entry.phoneNumbers[0] || null,
    fax: entry.faxNumbers[0] || null,
    phoneNumbers: entry.phoneNumbers,
    faxNumbers: entry.faxNumbers,
    departments: entry.departments,
    services: entry.services,
    specialties: entry.topSpecialties.map(spec => spec.name),
    doctorCount: entry.doctorCount,
    acceptingCount: entry.acceptingCount,
    featuredDoctors: entry.featuredDoctors,
    summary: entry.summary,
    dataKey: entry.key,
    lastUpdated: new Date().toISOString()
  };
}

function buildSpecialtyDoc(specialty, rawEntry) {
  const topLocations = Array.from(rawEntry.locations.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const languages = Array.from(rawEntry.languages.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const certifications = Array.from(rawEntry.boardCertifications.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const entry = {
    specialty,
    doctorCount: rawEntry.doctorCount,
    acceptingCount: rawEntry.acceptingCount,
    topLocations: topLocations.slice(0, 5),
    languages: languages.slice(0, 5),
    certifications: certifications.slice(0, 5),
    sampleDoctors: Array.from(rawEntry.sampleDoctors).slice(0, 5)
  };

  const summary = summarizeSpecialty(entry);

  const details = [
    `• Total physicians: ${entry.doctorCount}`,
    `• Currently accepting new patients: ${entry.acceptingCount}`,
    entry.topLocations.length ? `• Frequent practice locations: ${entry.topLocations.map(loc => `${loc.name} (${loc.count})`).join(', ')}` : null,
    entry.languages.length ? `• Languages represented: ${entry.languages.map(lang => `${lang.name} (${lang.count})`).join(', ')}` : null,
    entry.certifications.length ? `• Common board certifications: ${entry.certifications.map(cert => `${cert.name} (${cert.count})`).join(', ')}` : null
  ]
    .filter(Boolean)
    .join('\n');

  return {
    type: 'content',
    title: `${specialty} at UCSF Health`,
    slug: toSlug(`${specialty}-ucsf-health`),
    category: 'Specialty Insights',
    tags: [
      specialty,
      ...entry.topLocations.map(loc => loc.name)
    ].filter(Boolean),
    summary,
    content: `${summary}\n\n${details}`,
    doctorCount: entry.doctorCount,
    acceptingCount: entry.acceptingCount,
    topLocations: entry.topLocations.map(loc => loc.name),
    featuredPhysicians: entry.sampleDoctors,
    languages: entry.languages.map(lang => lang.name),
    boardCertifications: entry.certifications.map(cert => cert.name),
    publishedDate: new Date().toISOString(),
    author: 'UCSF Health Medical Staff'
  };
}

async function bulkIndex(index, docs) {
  if (!docs.length) {
    console.log(`ℹ️ No documents to index for ${index}`);
    return;
  }

  const chunkSize = 500;
  let chunkCount = 0;

  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    chunkCount += 1;

    console.log(`📦 Indexing ${index} chunk ${chunkCount} (${chunk.length} documents)...`);

    const body = chunk.flatMap(doc => [
      { index: { _index: index } },
      doc
    ]);

    const response = await client.bulk({ body, refresh: false });
    if (response.errors || response.body?.errors) {
      console.error(`❌ ${index} chunk ${chunkCount} had errors`, JSON.stringify(response.items?.[0] || response.body?.items?.[0], null, 2));
    }
  }
}

async function importDoctorsCSV() {
  try {
    console.log('🔄 Starting UCSF doctors CSV import...');

    const indexConfigs = {
      doctors: {
        mappings: {
          properties: {
            type: { type: 'keyword' },
            npi: { type: 'keyword' },
            providerId: { type: 'keyword' },
            name: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                suggest: { type: 'completion' }
              }
            },
            firstName: { type: 'keyword' },
            lastName: { type: 'keyword' },
            middleName: { type: 'keyword' },
            suffix: { type: 'keyword' },
            gender: { type: 'keyword' },
            title: { type: 'keyword' },
            language: { type: 'keyword' },
            specialty: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                suggest: { type: 'completion' }
              }
            },
            secondarySpecialties: { type: 'keyword' },
            boardCertifications: { type: 'text' },
            education: { type: 'text' },
            institution: { type: 'text' },
            graduationDate: { type: 'date' },
            location: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                suggest: { type: 'completion' }
              }
            },
            locationCode: { type: 'keyword' },
            address: { type: 'text' },
            city: { type: 'keyword' },
            state: { type: 'keyword' },
            zip: { type: 'keyword' },
            phone: { type: 'keyword' },
            fax: { type: 'keyword' },
            department: { type: 'keyword' },
            acceptingPatients: { type: 'boolean' },
            staffStatus: { type: 'keyword' },
            pcpSpec: { type: 'keyword' },
            licenseNumber: { type: 'keyword' },
            dateOnStaff: { type: 'date' },
            currentFromDate: { type: 'date' },
            currentToDate: { type: 'date' },
            experience: { type: 'integer' },
            rating: { type: 'float' },
            reviews: { type: 'integer' },
            profileImage: { type: 'keyword' }
          }
        }
      },
      locations: {
        mappings: {
          properties: {
            type: { type: 'keyword' },
            name: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                suggest: { type: 'completion' }
              }
            },
            location: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                suggest: { type: 'completion' }
              }
            },
            locationCode: { type: 'keyword' },
            address: { type: 'text' },
            city: { type: 'keyword' },
            state: { type: 'keyword' },
            zip: { type: 'keyword' },
            phone: { type: 'keyword' },
            fax: { type: 'keyword' },
            phoneNumbers: { type: 'keyword' },
            faxNumbers: { type: 'keyword' },
            departments: { type: 'keyword' },
            services: { type: 'keyword' },
            specialties: { type: 'keyword' },
            doctorCount: { type: 'integer' },
            acceptingCount: { type: 'integer' },
            featuredDoctors: { type: 'keyword' },
            summary: { type: 'text' },
            dataKey: { type: 'keyword' },
            lastUpdated: { type: 'date' }
          }
        }
      },
      content: {
        mappings: {
          properties: {
            type: { type: 'keyword' },
            title: {
              type: 'text',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            slug: { type: 'keyword' },
            content: { type: 'text' },
            summary: { type: 'text' },
            category: { type: 'keyword' },
            tags: { type: 'keyword' },
            doctorCount: { type: 'integer' },
            acceptingCount: { type: 'integer' },
            topLocations: { type: 'keyword' },
            featuredPhysicians: { type: 'keyword' },
            languages: { type: 'keyword' },
            boardCertifications: { type: 'keyword' },
            publishedDate: { type: 'date' },
            author: { type: 'keyword' }
          }
        }
      }
    };

    // Clear and recreate indices
    for (const indexName of Object.keys(indexConfigs)) {
      try {
        await client.indices.delete({ index: indexName });
        console.log(`🗑️ Cleared existing ${indexName} index`);
      } catch (error) {
        console.log(`ℹ️ No existing ${indexName} index to clear`);
      }
    }

    for (const [indexName, body] of Object.entries(indexConfigs)) {
      await client.indices.create({ index: indexName, body });
      console.log(`✅ Created ${indexName} index with mapping`);
    }

    const doctorsByNpi = new Map();
    const locationsMap = new Map();
    const specialtyMap = new Map();
    let doctorBatch = [];
    let processedCount = 0;
    const pendingDoctorBatches = [];

    const registerLocation = (doctor) => {
      const keyParts = [
        doctor.location || '',
        doctor.address || '',
        doctor.city || '',
        doctor.state || '',
        doctor.zip || '',
        doctor.locationCode || ''
      ]
        .map(part => cleanString(part).toLowerCase())
        .filter(Boolean);

      if (keyParts.length === 0) {
        return;
      }

      const key = keyParts.join('|');

      if (!locationsMap.has(key)) {
        locationsMap.set(key, {
          name: doctor.location || 'UCSF Health Location',
          location: doctor.location || 'UCSF Health Location',
          locationCode: doctor.locationCode || null,
          address: doctor.address || null,
          city: doctor.city || null,
          state: doctor.state || null,
          zip: doctor.zip || null,
          phoneNumbers: new Set(),
          faxNumbers: new Set(),
          departments: new Set(),
          specialties: new Map(),
          doctorCount: 0,
          acceptingCount: 0,
          sampleDoctors: new Set()
        });
      }

      const entry = locationsMap.get(key);
      entry.doctorCount += 1;
      if (doctor.acceptingPatients) {
        entry.acceptingCount += 1;
      }
      if (doctor.specialty) {
        entry.specialties.set(
          doctor.specialty,
          (entry.specialties.get(doctor.specialty) || 0) + 1
        );
      }
      if (doctor.department) {
        entry.departments.add(doctor.department);
      }
      if (doctor.phone) {
        entry.phoneNumbers.add(doctor.phone);
      }
      if (doctor.fax) {
        entry.faxNumbers.add(doctor.fax);
      }
      if (doctor.name) {
        entry.sampleDoctors.add(doctor.name);
      }
    };

    const registerSpecialty = (doctor) => {
      const specialty = doctor.specialty;
      if (!specialty) return;

      if (!specialtyMap.has(specialty)) {
        specialtyMap.set(specialty, {
          doctorCount: 0,
          acceptingCount: 0,
          locations: new Map(),
          languages: new Map(),
          boardCertifications: new Map(),
          sampleDoctors: new Set()
        });
      }

      const entry = specialtyMap.get(specialty);
      entry.doctorCount += 1;
      if (doctor.acceptingPatients) {
        entry.acceptingCount += 1;
      }
      if (doctor.location) {
        entry.locations.set(
          doctor.location,
          (entry.locations.get(doctor.location) || 0) + 1
        );
      }
      const langs = parseDelimitedList(doctor.language);
      langs.forEach(lang => {
        entry.languages.set(lang, (entry.languages.get(lang) || 0) + 1);
      });
      (doctor.boardCertifications || []).forEach(cert => {
        if (cert) {
          entry.boardCertifications.set(
            cert,
            (entry.boardCertifications.get(cert) || 0) + 1
          );
        }
      });
      if (doctor.name) {
        entry.sampleDoctors.add(doctor.name);
      }
    };

    const processDoctorBatch = async (batch) => {
      if (!batch.length) {
        return;
      }
      const currentBatchNumber = Math.ceil(processedCount / BATCH_SIZE) + 1;
      console.log(`📦 Processing doctors batch ${currentBatchNumber} (${batch.length} records)...`);

      const bulkBody = batch.flatMap(doc => [{ index: { _index: 'doctors' } }, doc]);
      const response = await client.bulk({ body: bulkBody, refresh: false });

      if (response.errors || response.body?.errors) {
        console.error(
          `❌ Doctors batch ${currentBatchNumber} had errors:`,
          JSON.stringify(response.items?.[0] || response.body?.items?.[0], null, 2)
        );
      }
      processedCount += batch.length;
    };

    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../../doctorsdata.CSV'))
        .pipe(csv())
        .on('data', (row) => {
          try {
            const npi = cleanString(row['NPI']);
            if (!npi) {
              return;
            }

            const boardCert = cleanString(row['BOARD CERTIFICATION SPECIALTY']);

            if (doctorsByNpi.has(npi)) {
              const existingDoctor = doctorsByNpi.get(npi);
              if (boardCert && !existingDoctor.boardCertifications.includes(boardCert)) {
                existingDoctor.boardCertifications.push(boardCert);
              }
              return;
            }

            const secondarySpecialties = parseDelimitedList(row['SECONDARY SPECIALTIES']);
            const languageList = parseDelimitedList(row['LANGUAGE']);
            const graduationDate = parseDate(row['GRADUATION DATE']);

            const doctor = {
              type: 'doctor',
              npi,
              providerId: cleanString(row['PROVIDER ID']),
              name: `${cleanString(row['FIRST NAME'])} ${cleanString(row['MIDDLE NAME'])} ${cleanString(row['LAST NAME'])} ${cleanString(row['SUFFIX'])}`.replace(/\s+/g, ' ').trim(),
              firstName: cleanString(row['FIRST NAME']),
              lastName: cleanString(row['LAST NAME']),
              middleName: cleanString(row['MIDDLE NAME']),
              suffix: cleanString(row['SUFFIX']),
              gender: cleanString(row['GENDER']),
              title: cleanString(row['TITLE']),
              language: languageList.join(', '),
              specialty: cleanString(row['PRIMARY SPECIALTY']),
              secondarySpecialties,
              boardCertifications: boardCert ? [boardCert] : [],
              education: cleanString(row['DEGREE']),
              institution: cleanString(row['INSTITUTION']),
              graduationDate,
              locationCode: cleanString(row['SUBGROUP']),
              location: locationMapping[cleanString(row['SUBGROUP'])] || cleanString(row['PRIMARY LOCATION']) || 'UCSF Medical Center',
              address: `${cleanString(row['PRIMARYADDRESSLINE1'])} ${cleanString(row['PRIMARYADDRESSLINE2'])}`.replace(/\s+/g, ' ').trim(),
              city: cleanString(row['PRIMARYCITY']),
              state: cleanString(row['PRIMARYSTATE']),
              zip: cleanString(row['PRIMARYZIP']),
              phone: cleanString(row['PRIMARYPHONE1']),
              fax: cleanString(row['PRIMARYFAX']),
              department: cleanString(row['DEPARTMENT']),
              acceptingPatients: parseNewPatients(row['NEW PATIENT']),
              staffStatus: cleanString(row['STAFF STATUS']),
              pcpSpec: cleanString(row['PCP / SPEC']),
              licenseNumber: cleanString(row['CA LICENSE']),
              dateOnStaff: parseDate(row['DATE ON STAFF']),
              currentFromDate: parseDate(row['CURRENT FROM DATE']),
              currentToDate: parseDate(row['CURRENT TO DATE']),
              experience: getExperienceYears(graduationDate),
              rating: null,
              reviews: null,
              profileImage: cleanString(row['FIRST NAME']) && cleanString(row['LAST NAME'])
                ? `https://via.placeholder.com/150?text=${cleanString(row['FIRST NAME']).charAt(0)}${cleanString(row['LAST NAME']).charAt(0)}`
                : null
            };

            doctorsByNpi.set(npi, doctor);
            doctorBatch.push(doctor);
            registerLocation(doctor);
            registerSpecialty(doctor);

            if (doctorBatch.length >= BATCH_SIZE) {
              pendingDoctorBatches.push(processDoctorBatch(doctorBatch));
              doctorBatch = [];
            }
          } catch (error) {
            console.error('Error processing row:', error);
          }
        })
        .on('end', async () => {
          try {
            if (doctorBatch.length) {
              pendingDoctorBatches.push(processDoctorBatch(doctorBatch));
              doctorBatch = [];
            }

            await Promise.all(pendingDoctorBatches);
            console.log(`\n📊 Deduplication Summary:`);
            console.log(`Total unique doctors (by NPI): ${doctorsByNpi.size}`);

            const locationDocs = Array.from(locationsMap.entries()).map(([key, entry]) =>
              buildLocationDoc(key, entry)
            );
            const specialtyDocs = Array.from(specialtyMap.entries()).map(([specialty, entry]) =>
              buildSpecialtyDoc(specialty, entry)
            );

            await bulkIndex('locations', locationDocs);
            await bulkIndex('content', specialtyDocs);

            await Promise.all([
              client.indices.refresh({ index: 'doctors' }),
              client.indices.refresh({ index: 'locations' }),
              client.indices.refresh({ index: 'content' })
            ]);

            const [doctorCount, locationCount, contentCount] = await Promise.all([
              client.count({ index: 'doctors' }),
              client.count({ index: 'locations' }),
              client.count({ index: 'content' })
            ]);

            console.log(`✅ Imported ${doctorCount.body?.count || doctorCount.count} doctors`);
            console.log(`✅ Derived ${locationCount.body?.count || locationCount.count} practice locations`);
            console.log(`✅ Generated ${contentCount.body?.count || contentCount.count} specialty insights`);

            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });

    // Post-import statistics for doctors
    const stats = await client.search({
      index: 'doctors',
      body: {
        aggs: {
          specialties: {
            terms: {
              field: 'specialty.keyword',
              size: 10
            }
          },
          locations: {
            terms: {
              field: 'location.keyword',
              size: 10
            }
          },
          acceptingPatients: {
            terms: {
              field: 'acceptingPatients'
            }
          }
        },
        size: 0
      }
    });

    const statsBody = stats.body || stats;
    console.log('\n📊 Import Statistics:');
    console.log('Top Specialties:');
    (statsBody.aggregations.specialties.buckets || []).forEach(bucket => {
      console.log(`  ${bucket.key}: ${bucket.doc_count} doctors`);
    });

    console.log('\nLocations:');
    (statsBody.aggregations.locations.buckets || []).forEach(bucket => {
      console.log(`  ${bucket.key}: ${bucket.doc_count} doctors`);
    });

    console.log('\nPatient Acceptance:');
    (statsBody.aggregations.acceptingPatients.buckets || []).forEach(bucket => {
      console.log(`  ${bucket.key}: ${bucket.doc_count} doctors`);
    });
  } catch (error) {
    console.error('Import error:', error);
  }
}

if (require.main === module) {
  importDoctorsCSV();
}

module.exports = importDoctorsCSV;
