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

function convertHundredsPart(hundreds, remaining) {
  if (hundreds === 1) {
    return 'cent';
  }
  
  const result = units[hundreds] + ' cent';
  return hundreds > 1 && remaining === 0 ? result + 's' : result;
}

function convertSpecialTens(tensDigit, num) {
  const base = tensDigit === 7 ? 'soixante' : 'quatre-vingt';
  const addition = tensDigit === 7 ? num - 60 : num - 80;
  
  if (addition >= 10) {
    return base + '-' + teens[addition - 10];
  }
  
  return base + (addition > 0 ? '-' + units[addition] : '');
}

function convertRegularTens(tensDigit, unitsDigit) {
  let result = tens[tensDigit];
  
  if (unitsDigit > 0) {
    result += '-' + units[unitsDigit];
  } else if (tensDigit === 8) {
    result += 's';
  }
  
  return result;
}

function convertTensPart(num) {
  if (num >= 20) {
    const tensDigit = Math.floor(num / 10);
    const unitsDigit = num % 10;
    
    if (tensDigit === 7 || tensDigit === 9) {
      return convertSpecialTens(tensDigit, num);
    }
    
    return convertRegularTens(tensDigit, unitsDigit);
  }
  
  if (num >= 10) {
    return teens[num - 10];
  }
  
  if (num > 0) {
    return units[num];
  }
  
  return '';
}

function convertHundreds(num) {
  let result = '';
  
  if (num >= 100) {
    const hundreds = Math.floor(num / 100);
    const remaining = num % 100;
    
    result += convertHundredsPart(hundreds, remaining);
    
    if (remaining > 0) {
      result += ' ';
    }
    
    num = remaining;
  }
  
  const tensResult = convertTensPart(num);
  if (tensResult) {
    result += tensResult;
  }
  
  return result;
}

function addScalePlural(word, count) {
  return count > 1 && (word === 'million' || word === 'milliard') ? word + 's' : word;
}

function processScale(scale, num, count) {
  if (scale.value === 1000 && count === 1) {
    return 'mille';
  }
  
  const scaleWord = addScalePlural(scale.word, count);
  return convertHundreds(count) + ' ' + scaleWord;
}

function processScales(num, result) {
  for (const scale of scales) {
    if (num >= scale.value) {
      const count = Math.floor(num / scale.value);
      
      result += processScale(scale, num, count);
      
      num %= scale.value;
      if (num > 0) {
        result += ' ';
      }
    }
  }
  
  return { num, result };
}

export function numberToWords(number) {
  if (number === 0) return 'zéro';
  
  let num = Math.floor(Math.abs(number));
  let result = number < 0 ? 'moins ' : '';
  
  const processed = processScales(num, result);
  num = processed.num;
  result = processed.result;
  
  if (num > 0) {
    result += convertHundreds(num);
  }
  
  return result.trim();
}