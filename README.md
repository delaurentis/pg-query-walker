# pg-query-walker

This `npm` module walks thru any PostgresQL query, and enumerates all database tables and columns used.  

## Features

- Uses the native query parser inside PostgresQL
- Can analyze any valid PSQL query
- Handles complex queries including WITH statements
- Returns only real table names and column names
- Ignores common table expressions and intermediate columns

## Install

```
$ npm install pg-query-walker
```

## Usage

```javascript
// Use the file system module to read SQL files
// and the query walker to analyze them
const fs = require('fs');
const walker = require('pg-query-walker');

// Analyze SQL from a file
const analysis = walker.analyzeSQL(fs.readFileSync('pets.sql', 'utf8'));

// Display the results
console.log('Tables Used: ', analysis.tables);
console.log('Columns Used: ', analysis.columns);
```

## SQL Input

```sql
SELECT name, born_at, a.name AS species FROM pets
INNER JOIN animals a ON a.id = pets.animal_id
ORDER BY born_at
```

## JSON Output

```javascript
{ 
  tables: ["animals", "pets"], 
  columns: { "animals.name", 
             "pets.born_at", 
             "pets.name" } 
}
```
