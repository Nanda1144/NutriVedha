const fs = require('fs');
const path = 'c:/projects/nutivedha/nutrivedha-CROP-GYM-FOOD RECIPE/src/data/foodDatabase.ts';
let content = fs.readFileSync(path, 'utf8');

// Fix the function definition
content = content.replace(/const generatePlaceholderImage = \(name: string, category: string\)/, 'const generatePlaceholderImage = (name: string)');

// Fix the calls
content = content.replace(/image: generatePlaceholderImage\(\)/g, (match, offset) => {
    // Look backwards to find the name
    const before = content.substring(0, offset);
    const nameMatch = before.match(/name: ("[^"]+")/g);
    if (nameMatch) {
        const lastName = nameMatch[nameMatch.length - 1].match(/"([^"]+)"/)[1];
        return `image: generatePlaceholderImage("${lastName}")`;
    }
    return match;
});

fs.writeFileSync(path, content);
console.log('Fixed foodDatabase.ts');
