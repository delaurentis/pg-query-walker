const util = require('util');
const { subtreesWithKey } = require('./subtree');

// Gives us a list of dependencies based on a simple select statement from a SQL query
// You can't pass WITH statements to this version (they need to be pre-broken up)
// Accepts: A single subquery represented by an AST tree from Postgres Query Parser
// Returns: { tables: ["animals", "pets"], columns: { "animals.name", "pets.born_at", "pets.name" }}
const dependenciesFromSubQuery = (query) => {
  
  // All table names used by the query are stored in a field 
  // called "relname" inside of a "fromClause"
  const fromClauses = subtreesWithKey(query, 'fromClause');
  const tablesUsed = subtreesWithKey(fromClauses, 'relname');
  const sortedTablesUsed = tablesUsed.sort((a, b) => {
    return (a?.location || 0) - (b?.location || 0);
  })

  // The first table name will be the default for the query
  const defaultTableName = sortedTablesUsed[0]?.relname;

  // Get de-dupped version of all table names
  const allTableNames = [...new Set(tablesUsed.map(name => name.relname))];

  // For each table, let's get the alias to get our table aliases
  const tableAliases = tablesUsed.reduce((index, subtree) => {
    const tableName = subtree.relname;
    const alias = subtree?.alias?.Alias?.aliasname;
    if ( alias !== undefined ) {
      index[alias] = tableName;
    }
    return index;
  }, {});

  // Get a list of any fake table names
  const fakeTableNames = subtreesWithKey(query, 'ctename').reduce((index, subtree) => {
    index[subtree.ctename] = true;
    return index;
  }, {});

  // Remove any fake tables from our list of real table names
  const realTableNames = allTableNames.filter(name => !fakeTableNames[name]);

  // Let's get all the columns
  const columnRefs = subtreesWithKey(query, 'ColumnRef');
  const columnArrays = columnRefs.map(columnRef => {
    const columnParts = subtreesWithKey(columnRef, 'str').map(item => item.str).reverse();
    const columnStar = subtreesWithKey(columnRef, 'A_Star').map(item => '*');
    return columnParts.concat(columnStar).flat();
  });

  // Compute all real column names
  const realColumnNames = columnArrays.reduce((results, array) => {
    if ( array.length === 2 ) {
      const [tableName, columnName] = array;
      const fullTableName = tableAliases[tableName] || tableName;
      if ( !fakeTableNames[fullTableName] ) {
        results.push(`${fullTableName}.${columnName}`);
      }
    }
    else if ( array.length === 1 && !fakeTableNames[defaultTableName] ) {
      results.push(`${defaultTableName}.${array[0]}`);
    }
    return results;
  }, []);

  // De-dup, sort, and return both table and column names
  const uniqueSortedTableNames = [...new Set(realTableNames)].sort();
  const uniqueSortedColumnNames = [...new Set(realColumnNames)].sort();
  return { tables: uniqueSortedTableNames, columns: uniqueSortedColumnNames }
};

// Gives us a list of dependencies based on an arbirarily complex SQL statement
// Accepts: A SQL query in parsed AST form
// Returns: { tables: ["animals", "pets"], columns: { "animals.name", "pets.born_at", "pets.name" }}
const dependenciesFromComplexQuery = (query) => {

  // First, just do our basic final query (we'll do the with clauses after if there are any)
  const { withClause, ...finalQuery } = query.SelectStmt;
  const finalDependencies = dependenciesFromSubQuery(finalQuery);

  // Start with any subqueries
  const ctes = subtreesWithKey(query, 'CommonTableExpr');
  const queryDependencies = ctes.map(cte => {
    const subQuery = cte.CommonTableExpr?.ctequery;
    return dependenciesFromSubQuery(subQuery);
  }).concat(finalDependencies)

  // Get a list of any fake table names
  const fakeTableNameMap = subtreesWithKey(query, 'ctename').reduce((index, subtree) => {
    index[subtree.ctename] = true;
    return index;
  }, {});

  // Combine the tables and columns from all subqueries
  const combinedTables = queryDependencies.map(dependencies => dependencies.tables).flat();
  const combinedColumns = queryDependencies.map(dependencies => dependencies.columns).flat();

  // Add all of our dependencies together now  
  const uniqueTables = [...new Set(combinedTables)].sort();
  const uniqueColumns = [...new Set(combinedColumns)].sort();

  // Filter out any temporary fake tables and columns
  const realTables = uniqueTables.filter(table => !fakeTableNameMap[table]);
  const realColumns = uniqueColumns.filter(column => {
    const table = column.split('.')[0];
    return !fakeTableNameMap[table];
  })

  // Return all of our dependencies
  return { tables: realTables, columns: realColumns };
}

module.exports = { dependenciesFromComplexQuery };