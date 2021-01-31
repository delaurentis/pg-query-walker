const fs = require('fs');
const walker = require('./index.js');

// Analyze all queries
const withAnalysis = walker.analyzeSQL(fs.readFileSync('./sql/with.sql', 'utf8'));

test('Basic Select', () => {
  const analysis = walker.analyzeSQL(fs.readFileSync('./sql/basic.sql', 'utf8'));
  expect(analysis.tables).toEqual(['pets']);
  expect(analysis.columns).toEqual(['pets.born_at', 'pets.name']);
});

test('Join', () => {
  const analysis = walker.analyzeSQL(fs.readFileSync('./sql/join.sql', 'utf8'));
  expect(analysis.tables).toEqual(['animals', 'pets']);
  expect(analysis.columns).toEqual([
    'animals.id',
    'animals.name',
    'pets.animal_id',
    'pets.born_at',
    'pets.name'
  ]);
});

test('With (Multiple Selects)', () => {
  const analysis = walker.analyzeSQL(fs.readFileSync('./sql/with.sql', 'utf8'));
  expect(analysis.tables).toEqual(['animals', 'pets']);
  expect(analysis.columns).toEqual([
    'animals.id',
    'animals.name',
    'pets.animal_id',
    'pets.born_at',
    'pets.id',
    'pets.name'
  ]);
});
