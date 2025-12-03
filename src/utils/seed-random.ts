/**
 * Generador de números pseudoaleatorios determinístico basado en seed
 * Permite generar secuencias reproducibles de números aleatorios
 */
export class SeedRandom {
  private seed: number;

  constructor(seed: string) {
    // Convertir el string seed en un número
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    this.seed = Math.abs(hash);
  }

  /**
   * Genera un número pseudoaleatorio entre 0 y 1
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Genera un número entero aleatorio entre min (inclusive) y max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Genera un número decimal aleatorio entre min (inclusive) y max (exclusive)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
}

