const parser = require('pg-query-parser');
const { dependenciesFromComplexQuery } = require('./lib/query');

// Walks the given SQL query, and returns a list of tables and columns used
// Accepts: Pass in a string containing arbitrarily complex SQL
// Returns: { tables: ["animals", "pets"], 
//            columns: { "animals.name", "pets.born_at", "pets.name" } }
const analyzeSQL = (sql) => {
  try {

    // Extract a query AST from our SQL
    const query = parser.parse(sql)?.query?.[0];

    // Return our dependencies
    return dependenciesFromComplexQuery(query);
  }
  catch(error) {
    //throw new Error("Please check SQL.  May not be valid.");
    throw(error);
  }
};

module.exports = { analyzeSQL };
