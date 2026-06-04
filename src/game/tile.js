export class Tile {
  constructor(letter, baseScore, attributes = {}) {
    this.id = crypto.randomUUID();
    this.letter = letter;
    this.baseScore = baseScore;
    this.scoreModifier = 0;
    this.attributes = attributes;
  }

  get score() {
    return Math.max(0, this.baseScore + this.scoreModifier);
  }

  increaseScore(amount = 1) {
    this.scoreModifier += amount;
  }

  decreaseScore(amount = 1) {
    this.scoreModifier -= amount;
  }
}