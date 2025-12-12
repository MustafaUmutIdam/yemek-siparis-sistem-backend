/*
  Simple script to dump swaggerSpec paths and tags for debugging
  Usage: npm run swagger:dump
*/

try {
  const swaggerSpec = require('../src/config/swagger');

  console.log('--- Swagger Tags ---');
  if (swaggerSpec.tags) {
    swaggerSpec.tags.forEach((t) => console.log(`- ${t.name}: ${t.description || ''}`));
  } else {
    console.log('No tags found');
  }

  console.log('\n--- Paths ---');
  const paths = swaggerSpec.paths || {};
  const keys = Object.keys(paths);
  if (keys.length === 0) {
    console.log('No paths found in generated swagger spec');
  } else {
    keys.forEach((p) => console.log(p));
  }

  // Optionally, output full JSON to file
  // const fs = require('fs');
  // fs.writeFileSync('swagger-dump.json', JSON.stringify(swaggerSpec, null, 2));
} catch (err) {
  console.error('Error loading swagger spec:', err.message);
  process.exit(1);
}
