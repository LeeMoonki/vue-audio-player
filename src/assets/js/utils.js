export const youtubeParser = url => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);

  return (match&&match[7].length==11)? match[7] : false;
}

export function getZeroBaseDigit(num, length = 2) {
  let result = [];
  let n = num - 0;

  if (isNaN(n)) {
    return num || '';
  }

  for (let i = 0; i < length; i++) {
    result.push('0');
  }

  if (n > 0) {
    for (const i in result) {
      result[length - i - 1] = n % 10;
      n = ~~(n / 10);
    }
  }

  return result.join('');
}

export const timeformat = (time, maxUnit) => {
  if (time == 0) {
    return !maxUnit || maxUnit === 'h' ? '00:00:00.000' : maxUnit === 'm' ? '00:00.000' : '00:00:00.000';
  }
  let result = '';

  if (!maxUnit || maxUnit === 'h') {
    const h = ~~(time / 3600);
    const m = ~~((time % 3600) / 60);
    const s = time % 60;

    result = `${getZeroBaseDigit(h)}:${getZeroBaseDigit(m)}:${getZeroBaseDigit(s).slice(0, 6)}`;
  } else if (maxUnit === 'm') {
    const m = ~~((time % 3600) / 60);
    const s = time % 60;

    result = `${getZeroBaseDigit(m)}:${getZeroBaseDigit(s).slice(0, 6)}`;
  }
  

  return result;
};
