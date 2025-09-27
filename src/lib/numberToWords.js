export function numberToWords(n) {
  if (n === 0) return 'zéro';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  function convert(num) {
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 70 || (num > 79 && num < 90)) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      if (unit === 1 && ten !== 8) return `${tens[ten]}-et-un`;
      return `${tens[ten]}${unit > 0 ? '-' + units[unit] : ''}`;
    }
    if (num < 80) { // 70-79
      return `${tens[6]}-${teens[num - 70]}`;
    }
    if (num < 100) { // 90-99
      return `${tens[8]}-${teens[num - 90]}`;
    }
    if (num < 200) {
      return `cent${num > 100 ? ' ' + convert(num % 100) : ''}`;
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      return `${units[hundred]} cent${rest > 0 ? ' ' + convert(rest) : (hundred > 1 ? 's' : '')}`;
    }
    return '';
  }

  function convertGroup(num, groupName, isPlural) {
    if (num === 0) return '';
    let result = '';
    if (num > 1) {
      result = convert(num) + ' ' + groupName;
      if (isPlural) result += 's';
    } else {
      result = (groupName === 'mille' ? '' : 'un ') + groupName;
    }
    return result;
  }

  let words = [];
  const billions = Math.floor(n / 1000000000);
  const millions = Math.floor((n % 1000000000) / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;

  if (billions > 0) words.push(convertGroup(billions, 'milliard', billions > 1));
  if (millions > 0) words.push(convertGroup(millions, 'million', millions > 1));
  if (thousands > 0) {
    if (thousands === 1) words.push('mille');
    else words.push(convert(thousands).replace(/un$/, '') + ' mille');
  }
  if (remainder > 0) words.push(convert(remainder));

  let finalWords = words.join(' ').trim();
  
  finalWords = finalWords.replace(/quatre-vingt un/g, 'quatre-vingt-un');
  finalWords = finalWords.replace(/cent s/g, 'cents');
  finalWords = finalWords.replace(/vingt un/g, 'vingt-et-un');
  
  return finalWords;
}