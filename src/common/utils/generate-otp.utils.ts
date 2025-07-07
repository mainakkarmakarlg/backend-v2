export class GenerateOtp {
  generate(length: number = 6): number {
    const min = Math.pow(10, length - 1); // Minimum value with the given length
    const max = Math.pow(10, length) - 1; // Maximum value with the given length
    return Math.floor(min + Math.random() * (max - min + 1));
  }
}
