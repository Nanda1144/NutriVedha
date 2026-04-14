const fs = require('fs');
const content = fs.readFileSync('src/data/foodDatabase.ts', 'utf8');

// Regex to find { name: "...", ... image: generatePlaceholderImage()
// We want to replace it with { name: "...", ... image: generatePlaceholderImage("...")
const fixed = content.replace(/\{ name: "([^"]+)", category: "([^"]+)", image: generatePlaceholderImage\(\)/g, '{ name: "$1", category: "$2", image: generatePlaceholderImage("$1")');

fs.writeFileSync('src/data/foodDatabase.ts', fixed);
console.log('Fixed database calls');
