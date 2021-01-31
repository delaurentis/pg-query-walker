// Credit for the forEachNested method goes to 
// Jack Griffin from this StackOverflow post: 
// https://stackoverflow.com/questions/8085004/iterate-through-nested-javascript-objects
const forEachNested = (tree, callback) => {
  
  // Ensure we have an array
  tree = [ tree ]; 

  // Keep processing the top item until we run out
  // We'll push items onto the array as we drill down
  while (tree.length) {
    const current = tree.pop();
    const shouldStop = callback(current);
    const isObjectOrArray = current instanceof Object && [Object, Array].includes(current.constructor);
    if ( !shouldStop && isObjectOrArray ) {

        // Search all values deeper inside
        tree.push.apply(tree, Object.values(current)); 
      }
  }
}

// Find a subtree that contains the given key
const subtreesWithKey = (tree, key) => {
  let results = [];
  forEachNested(tree, (currentValue) => {

    // If we find an object, and it has the specified child key... 
    // then we'll add the parent to our results
    if ( currentValue.constructor === Object && currentValue[key] ) {
      results.push(currentValue);
    }
  });
  return results;
}

module.exports = { subtreesWithKey };