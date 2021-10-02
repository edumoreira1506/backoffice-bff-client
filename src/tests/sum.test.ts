import sum from '../sum';

describe('sum', () => {
  it('return calculed value', () => {
    const number1 = 1;
    const number2 = 1;
    const expected = 2;

    expect(sum(number1, number2)).toEqual(expected);
  });
});
