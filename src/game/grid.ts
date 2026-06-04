export type PremiumKind =
  | 'normal'
  | 'double-letter'
  | 'triple-letter'
  | 'double-word'
  | 'triple-word';

export interface GridCell {
  row: number;
  col: number;
  letterMultiplier: number;
  wordMultiplier: number;
  premiumKind: PremiumKind;
  occupied: boolean;
  locked: boolean;
  properties: Record<string, unknown>;
}

export class Grid {
  readonly size: number;
  readonly cells: GridCell[][];

  constructor(size = 15) {
    this.size = size;
    this.cells = Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) =>
        this.createCell(row, col)
      )
    );

    this.applyClassicScrabbleMultipliers();
  }

  getCell(row: number, col: number): GridCell | null {
    if (!this.isInside(row, col)) return null;
    return this.cells[row][col];
  }

  isInside(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  setProperty(row: number, col: number, key: string, value: unknown): void {
    const cell = this.getCell(row, col);
    if (!cell) return;

    cell.properties[key] = value;
  }

  setOccupied(row: number, col: number, occupied: boolean): void {
    const cell = this.getCell(row, col);
    if (!cell) return;

    cell.occupied = occupied;
  }

  setLocked(row: number, col: number, locked: boolean): void {
    const cell = this.getCell(row, col);
    if (!cell) return;

    cell.locked = locked;
  }

  private createCell(row: number, col: number): GridCell {
    return {
      row,
      col,
      letterMultiplier: 1,
      wordMultiplier: 1,
      premiumKind: 'normal',
      occupied: false,
      locked: false,
      properties: {}
    };
  }

  private setPremium(
    row: number,
    col: number,
    premiumKind: PremiumKind
  ): void {
    const cell = this.getCell(row, col);
    if (!cell) return;

    cell.premiumKind = premiumKind;

    if (premiumKind === 'double-letter') {
      cell.letterMultiplier = 2;
      cell.wordMultiplier = 1;
    } else if (premiumKind === 'triple-letter') {
      cell.letterMultiplier = 3;
      cell.wordMultiplier = 1;
    } else if (premiumKind === 'double-word') {
      cell.letterMultiplier = 1;
      cell.wordMultiplier = 2;
    } else if (premiumKind === 'triple-word') {
      cell.letterMultiplier = 1;
      cell.wordMultiplier = 3;
    } else {
      cell.letterMultiplier = 1;
      cell.wordMultiplier = 1;
    }
  }

  private applyClassicScrabbleMultipliers(): void {
    const tripleWord = [
      [0, 0], [0, 7], [0, 14],
      [7, 0], [7, 14],
      [14, 0], [14, 7], [14, 14]
    ];

    const doubleWord = [
      [1, 1], [2, 2], [3, 3], [4, 4],
      [10, 10], [11, 11], [12, 12], [13, 13],
      [1, 13], [2, 12], [3, 11], [4, 10],
      [10, 4], [11, 3], [12, 2], [13, 1],
      [7, 7]
    ];

    const tripleLetter = [
      [1, 5], [1, 9],
      [5, 1], [5, 5], [5, 9], [5, 13],
      [9, 1], [9, 5], [9, 9], [9, 13],
      [13, 5], [13, 9]
    ];

    const doubleLetter = [
      [0, 3], [0, 11],
      [2, 6], [2, 8],
      [3, 0], [3, 7], [3, 14],
      [6, 2], [6, 6], [6, 8], [6, 12],
      [7, 3], [7, 11],
      [8, 2], [8, 6], [8, 8], [8, 12],
      [11, 0], [11, 7], [11, 14],
      [12, 6], [12, 8],
      [14, 3], [14, 11]
    ];

    tripleWord.forEach(([row, col]) =>
      this.setPremium(row, col, 'triple-word')
    );

    doubleWord.forEach(([row, col]) =>
      this.setPremium(row, col, 'double-word')
    );

    tripleLetter.forEach(([row, col]) =>
      this.setPremium(row, col, 'triple-letter')
    );

    doubleLetter.forEach(([row, col]) =>
      this.setPremium(row, col, 'double-letter')
    );
  }
}