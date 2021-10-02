export default function sum(...numbers: number[]): number {
  return numbers.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
}
