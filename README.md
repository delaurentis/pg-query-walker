```
const dependencies = new Dependencies();
dependencies.analyze('SELECT column1, column2 FROM my_table');
console.log('Tables Used: ', dependencies.tables);
console.log('Columns Used: ', dependencies.columns);
```