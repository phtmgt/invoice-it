import Decimal from 'decimal.js';

export default class Common {
  /**
   * @description Hydrate current instance with obj attributes
   * @param obj
   * @param attributes
   * @todo optimize it
   */
  hydrate(obj, attributes) {
    if (!obj) return;
    // eslint-disable-next-line no-restricted-syntax
    for (const item of attributes) {
      this[item] = (obj[item]) ? obj[item] : '';
    }
  }

  /**
   * @description Return number with padding
   * @example if id = 10, return 0010
   * @param num
   * @param size
   * @return {string}
   */
  pad(num, size = 3) {
    let output = num.toString();
    while (output.length < size) output = `0${output}`;
    return output;
  }

  /**
   * @description Check if is a number
   * @param n
   * @returns {boolean}
   */
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  /**
   * @description Round float with x decimals
   * @param num
   * @param decimals, default 2 decimals
   * @returns {number}
   */
  round(value, decimals = 2) {
    // if (!(`${num}`).includes('e')) {
    //   return +(`${Math.round(`${num}e+${decimals}`)}e-${decimals}`);
    // }
    // const arr = (`${num}`).split('e');
    // let sig = '';
    // if (+arr[1] + decimals > 0) sig = '+';
    // return +(`${Math.round(`${+arr[0]}e${sig}${+arr[1] + decimals}`)}e-${decimals}`);
    return Number(
      new Decimal(value).toDecimalPlaces(decimals),
    );
  }

  /**
   * @description Format number to return number with two decimals
   * @param num
   * @return {string}
   */
  formatOutputNumber(num, decimalSeparator = ',') {
    const number = num.toString();
    if (number.includes('.')) {
      const split = number.split('.');
      if (split[1].length === 1) return `${split[0]}${decimalSeparator}${split[1]}0`;
      if (split[1].length === 2) return `${split[0]}${decimalSeparator}${split[1][0]}${split[1][1]}`;
      if (split[1].length === 3) return `${split[0]}${decimalSeparator}${split[1][0]}${split[1][1]}${split[1][2]}`;
      if (split[1].length === 4) return `${split[0]}${decimalSeparator}${split[1][0]}${split[1][1]}${split[1][2]}${split[1][3]}`;
    }
    return `${number}${decimalSeparator}00`;
  }
}
