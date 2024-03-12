function sum(x, y) {
  return x + y;
}

function sum_strings(a) {
  let result = 0;
  for (const str of a) {
    const number = str.match(/^\d+/);
    result += parseInt(number || 0);
  }

  return result;
}

function digits(s) {
  let result = [0, 0];
  for (const char of s) {
    const number = parseInt(char);
    if (!isNaN(number)) {
      result[(number + 1) % 2] += number;
    }
  }

  return result;
}

function letters(s) {
  let result = [0, 0];
  for (const char of s) {
    if (/^[a-zA-Z]$/.test(char)) {
      if (char === char.toUpperCase()) {
        result[1]++;
      } else {
        result[0]++;
      }
    }
  }

  return result;
}
