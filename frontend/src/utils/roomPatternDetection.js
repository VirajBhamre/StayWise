/**
 * Detects patterns in room numbers and suggests the next numbers in the sequence
 */

// Check if a sequence follows a numeric pattern (1, 2, 3...)
const detectNumericPattern = (rooms) => {
  if (rooms.length < 3) return null;
  
  // Convert to numbers if possible
  const numbers = rooms.map(room => {
    const num = parseInt(room, 10);
    return isNaN(num) ? null : num;
  });
  
  // Check if all are numbers
  if (numbers.some(n => n === null)) return null;
  
  // Check if they form a sequence with consistent step
  const diffs = [];
  for (let i = 1; i < numbers.length; i++) {
    diffs.push(numbers[i] - numbers[i-1]);
  }
  
  // Check if all differences are the same
  const allSameDiff = diffs.every(d => d === diffs[0]);
  
  if (allSameDiff && diffs[0] > 0) {
    return {
      type: 'numeric',
      step: diffs[0],
      last: numbers[numbers.length - 1],
      prefix: '',
      nextNumbers: Array.from({ length: 10 }, (_, i) => 
        (numbers[numbers.length - 1] + (i + 1) * diffs[0]).toString()
      )
    };
  }
  
  return null;
};

// Check if a sequence follows an alphanumeric pattern with prefix (F1, F2, F3...)
const detectPrefixedPattern = (rooms) => {
  if (rooms.length < 3) return null;
  
  // Try to extract prefix and number
  const parts = rooms.map(room => {
    const match = room.match(/^([a-zA-Z]+)(\d+)$/);
    return match ? { prefix: match[1], num: parseInt(match[2], 10) } : null;
  });
  
  // Check if all match the pattern
  if (parts.some(p => p === null)) return null;
  
  // Check if all prefixes are the same
  const allSamePrefix = parts.every(p => p.prefix === parts[0].prefix);
  if (!allSamePrefix) return null;
  
  // Check if numbers form a sequence
  const numbers = parts.map(p => p.num);
  const diffs = [];
  for (let i = 1; i < numbers.length; i++) {
    diffs.push(numbers[i] - numbers[i-1]);
  }
  
  // Check if all differences are the same
  const allSameDiff = diffs.every(d => d === diffs[0]);
  
  if (allSameDiff && diffs[0] > 0) {
    return {
      type: 'prefixed',
      step: diffs[0],
      last: numbers[numbers.length - 1],
      prefix: parts[0].prefix,
      nextNumbers: Array.from({ length: 10 }, (_, i) => 
        `${parts[0].prefix}${numbers[numbers.length - 1] + (i + 1) * diffs[0]}`
      )
    };
  }
  
  return null;
};

// Main function to detect pattern and suggest next numbers
const detectRoomPattern = (rooms) => {
  // Try numeric pattern first
  const numericPattern = detectNumericPattern(rooms);
  if (numericPattern) return numericPattern;
  
  // Then try prefixed pattern
  const prefixedPattern = detectPrefixedPattern(rooms);
  if (prefixedPattern) return prefixedPattern;
  
  // No pattern detected
  return null;
};

export default detectRoomPattern;