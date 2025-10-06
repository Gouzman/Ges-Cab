const units = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'
];

const teens = [
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 
  'dix-sept', 'dix-huit', 'dix-neuf'
];

const tens = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 
  'quatre-vingt', 'quatre-vingt-dix'
];

const scales = [
  { value: 1000000000, word: 'milliard' },
  { value: 1000000, word: 'million' },
  { value: 1000, word: 'mille' },
  { value: 100, word: 'cent' }
];

function convertHundreds(num) {
  let result = '';
  
  if (num >= 100) {
    const hundreds = Math.floor(num / 100);
    if (hundreds === 1) {
      result += 'cent';
    } else {
      result += units[hundreds] + ' cent';
    }
    
    if (hundreds > 1 && num % 100 === 0) {
      result += 's';
    }
    
    num %= 100;
    if (num > 0) result += ' ';
  }
  
  if (num >= 20) {
    const tensDigit = Math.floor(num / 10);
    const unitsDigit = num % 10;
    
    if (tensDigit === 7 || tensDigit === 9) {
      const base = tensDigit === 7 ? 'soixante' : 'quatre-vingt';
      const addition = tensDigit === 7 ? num - 60 : num - 80;
      
      if (addition >= 10) {
        result += base + '-' + teens[addition - 10];
      } else {
        result += base + (addition > 0 ? '-' + units[addition] : '');
      }
    } else {
      result += tens[tensDigit];
      if (unitsDigit > 0) {
        result += '-' + units[unitsDigit];
      } else if (tensDigit === 8) {
        result += 's';
      }
    }
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += units[num];
  }
  
  return result;
}

export function numberToWords(number) {
  if (number === 0) return 'zéro';
  
  let num = Math.floor(Math.abs(number));
  let result = '';
  
  if (number < 0) result = 'moins ';
  
  for (const scale of scales) {
    if (num >= scale.value) {
      const count = Math.floor(num / scale.value);
      
      if (scale.value === 1000 && count === 1) {
        result += 'mille';
      } else {
        result += convertHundreds(count) + ' ' + scale.word;
        if (count > 1 && (scale.word === 'million' || scale.word === 'milliard')) {
          result += 's';
        }
      }
      
      num %= scale.value;
      if (num > 0) result += ' ';
    }
  }
  
  if (num > 0) {
    result += convertHundreds(num);
  }
  
  return result.trim();
}