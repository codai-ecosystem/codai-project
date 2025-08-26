// Debug script to test the Cypher parser
const query = `CREATE (p:Person {name: "Alice", age: 28})`;

// Tokenize like the improved CypherEngine does
const tokens = query
  .replace(/[()[\]{},]/g, ' $& ')
  .replace(/:/g, ' : ')
  .split(/\s+/)
  .filter(token => token.length > 0);

console.log('Query:', query);
console.log('Tokens:', tokens);

// Simulate the parsing logic
let currentIndex = 1; // Skip CREATE
console.log('Starting at index 1, token:', tokens[currentIndex]);

if (tokens[currentIndex] === '(') {
  currentIndex++; // Skip opening parenthesis
  console.log('After opening paren, index:', currentIndex, 'token:', tokens[currentIndex]);
  
  let variable, label;
  
  // Variable name (optional)
  if (tokens[currentIndex] && 
      !tokens[currentIndex].startsWith(':') && 
      !tokens[currentIndex].startsWith('{') &&
      tokens[currentIndex] !== ')') {
    variable = tokens[currentIndex];
    console.log('Found variable:', variable);
    currentIndex++;
  }
  
  // Label (starts with :)
  if (tokens[currentIndex] === ':') {
    currentIndex++; // Skip the colon
    if (tokens[currentIndex]) {
      label = tokens[currentIndex];
      console.log('Found label:', label);
      currentIndex++;
    }
  } else {
    console.log('No label found at index:', currentIndex, 'token:', tokens[currentIndex]);
  }
  
  // Properties (between { })
  if (tokens[currentIndex] === '{') {
    console.log('Found properties section');
    currentIndex++; // Skip opening brace
    
    while (tokens[currentIndex] !== '}' && currentIndex < tokens.length) {
      console.log('Property parsing - index:', currentIndex, 'token:', tokens[currentIndex]);
      const key = tokens[currentIndex];
      if (tokens[currentIndex + 1] === ':' && currentIndex + 2 < tokens.length) {
        let value = tokens[currentIndex + 2];
        
        // Clean up quoted values
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        console.log('Found property:', key, '=', value);
        currentIndex += 3;
        
        // Skip comma if present
        if (tokens[currentIndex] === ',') {
          console.log('Skipping comma');
          currentIndex++;
        }
      } else {
        currentIndex++;
      }
    }
  }
}