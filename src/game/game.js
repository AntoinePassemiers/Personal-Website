import Phaser from 'phaser';

import { Tile } from './tile.js';
import { Grid } from './grid.ts';

const ROUND_TARGETS = [40, 55, 70, 90, 115, 140, 180, 250, 400, 650, 1000];

const DEFAULT_TURNS_PER_ROUND = 4;
const DEFAULT_DISCARDS_PER_ROUND = 4;

const BOARD_SIZE = 15;
const TILE_SIZE = 36;

const BOARD_X = 40;
const BOARD_Y = 40;

const MENU_X = BOARD_X + BOARD_SIZE * TILE_SIZE + 40;
const MENU_Y = BOARD_Y;

const GAME_WIDTH = MENU_X + 260;
const GAME_HEIGHT = 640;

const LETTER_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2,
  H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1,
  O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1,
  V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const BAG_LETTERS =
  'EEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ';

function createBag() {
  return BAG_LETTERS
    .split('')
    .map((letter) => new Tile(letter, LETTER_VALUES[letter]));
}


class ScrabbleScene extends Phaser.Scene {

  async create() {

    await this.loadDictionary();

    this.roundIndex = 0;
    this.roundScore = 0;
    this.totalScore = 0;

    this.maxTurnsPerRound = DEFAULT_TURNS_PER_ROUND;
    this.maxDiscardsPerRound = DEFAULT_DISCARDS_PER_ROUND;

    this.turnsLeft = this.maxTurnsPerRound;
    this.discardsLeft = this.maxDiscardsPerRound;

    this.isRoundOver = false;
    this.isGameOver = false;

    this.bag = Phaser.Utils.Array.Shuffle(createBag());
    this.hand = [];
    this.handTiles = [];
    this.handY = 620;

    this.grid = new Grid();
    this.board = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => null)
    );

    this.cursorDirection = 'horizontal';
    this.placedThisTurn = [];
    this.cursorRow = 7;
    this.cursorCol = 7;
    this.score = 0;

    this.boardX = 40;
    this.boardY = 40;

    this.cameras.main.setBackgroundColor('#020617');

    this.drawBoard();
    this.drawCursor();
    this.drawUi();
    this.drawHandSlots();
    this.dealHand();
    this.setupKeyboard();
  }

  async loadDictionary() {
    const response = await fetch(`${import.meta.env.BASE_URL}src/game/data/en.txt`);
    if (!response.ok) {
      console.log(`${import.meta.env.BASE_URL}game/data/en.txt`);
      throw new Error(`Failed to load dictionary: ${response.status}`);
    }
    const text = await response.text();
    this.dictionary = new Set(
      text
        .split(/\r?\n/)
        .map((word) => word.trim().toUpperCase())
        .filter(Boolean)
    );
    console.log(this.dictionary.length);
  }

  drawBoard() {
    this.boardCells = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      this.boardCells[row] = [];

      for (let col = 0; col < BOARD_SIZE; col++) {
        const x = this.boardX + col * TILE_SIZE;
        const y = this.boardY + row * TILE_SIZE;

        const isCenter = row === 7 && col === 7;

        const gridCell = this.grid.getCell(row, col);

        const colorByPremium = {
          normal: 0x1e293b,
          'double-letter': 0x38bdf8,
          'triple-letter': 0x2563eb,
          'double-word': 0xf9a8d4,
          'triple-word': 0xef4444
        };

        const cell = this.add.rectangle(
          x,
          y,
          TILE_SIZE - 2,
          TILE_SIZE - 2,
          colorByPremium[gridCell.premiumKind]
        ).setOrigin(0);
        cell.setInteractive({ useHandCursor: true });
        cell.on('pointerdown', () => {
          this.setCursor(row, col);
        });

        const labelByPremium = {
          normal: '',
          'double-letter': 'DL',
          'triple-letter': 'TL',
          'double-word': 'DW',
          'triple-word': 'TW'
        };

        if (labelByPremium[gridCell.premiumKind]) {
          this.add.text(x + TILE_SIZE / 2, y + TILE_SIZE / 2, labelByPremium[gridCell.premiumKind], {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#020617'
          }).setOrigin(0.5);
        }

        this.boardCells[row][col] = cell;

        if (isCenter) {
          this.add.text(x + TILE_SIZE / 2, y + TILE_SIZE / 2, '★', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#facc15'
          }).setOrigin(0.5);
        }
      }
    }
  }

  drawCursor() {
    this.cursor = this.add.container(
      this.boardX + this.cursorCol * TILE_SIZE,
      this.boardY + this.cursorRow * TILE_SIZE
    );

    const box = this.add.rectangle(
      0,
      0,
      TILE_SIZE - 2,
      TILE_SIZE - 2
    )
      .setOrigin(0)
      .setStrokeStyle(3, 0x7dd3fc)
      .setFillStyle(0x000000, 0);

    this.chevron = this.add.text(
      TILE_SIZE / 2,
      TILE_SIZE / 2,
      '›',
      {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: '#7dd3fc'
      }
    ).setOrigin(0.5);

    this.cursor.add([box, this.chevron]);
  }

  drawUi() {
    this.roundText = this.add.text(MENU_X, MENU_Y, '', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#e2e8f0'
    });

    this.scoreText = this.add.text(MENU_X, MENU_Y + 36, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#e2e8f0',
      wordWrap: { width: 220 }
    });

    this.turnsText = this.add.text(MENU_X, MENU_Y + 90, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#e2e8f0'
    });

    this.discardsText = this.add.text(MENU_X, MENU_Y + 122, '', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#e2e8f0'
    });

    this.statusText = this.add.text(MENU_X, MENU_Y + 170, 'Move with arrows. Type A-Z to place letters.', {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#94a3b8',
      wordWrap: { width: 220 }
    });

    this.helpText = this.add.text(
      MENU_X,
      MENU_Y + 250,
      'A-Z: place letter\nSpace: toggle direction\nDelete: erase\nEnter: submit\nF: fullscreen',
      {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#64748b',
        lineSpacing: 8,
        wordWrap: { width: 220 }
      }
    );

    this.updateRoundUi();
  }

  getCurrentRoundTarget() {
    return ROUND_TARGETS[this.roundIndex] ?? ROUND_TARGETS[ROUND_TARGETS.length - 1];
  }

  updateRoundUi() {
    const target = this.getCurrentRoundTarget();

    this.roundText.setText(`Round ${this.roundIndex + 1}`);

    this.scoreText.setText(
      `Round target: ${target}\n` +
      `Round score: ${this.roundScore}/${target}\n` +
      `Total score: ${this.totalScore}`
    );

    this.turnsText.setText(`Turns left: ${this.turnsLeft}`);
    this.discardsText.setText(`Discards left: ${this.discardsLeft}`);
  }

  toggleCursorDirection() {
    this.cursorDirection =
      this.cursorDirection === 'horizontal' ? 'vertical' : 'horizontal';

    const targetAngle =
      this.cursorDirection === 'horizontal' ? 0 : 90;

    this.tweens.add({
      targets: this.chevron,
      angle: targetAngle,
      duration: 140,
      ease: 'Cubic.easeOut'
    });

    this.statusText.setText(
      this.cursorDirection === 'horizontal'
        ? 'Direction: horizontal'
        : 'Direction: vertical'
    );
  }

  drawHandSlots() {
    this.add.text(MENU_X, MENU_Y + 250, 'Hand', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#e2e8f0'
    });

    for (let i = 0; i < 7; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);

      this.add.rectangle(
        MENU_X + col * (TILE_SIZE + 10),
        MENU_Y + 280 + row * (TILE_SIZE + 10),
        TILE_SIZE,
        TILE_SIZE,
        0x334155
      ).setOrigin(0);
    }
  }

  dealHand() {
    while (this.hand.length < 7 && this.bag.length > 0) {
      this.hand.push(this.bag.pop());
    }

    this.renderHand();
  }

  renderHand() {
    for (const visual of this.handTiles) {
      visual.destroy();
    }

    this.handTiles = [];

    this.hand.forEach((tile, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);

      const visual = this.createVisualTile(
        tile,
        MENU_X + col * (TILE_SIZE + 10),
        MENU_Y + 280 + row * (TILE_SIZE + 10),
        false
      );

      this.handTiles.push(visual);
    });
  }

  setupKeyboard() {
    this.input.keyboard.on('keydown', (event) => {
      const key = event.key.toUpperCase();

      if (event.key === 'ArrowLeft') {
        this.moveCursor(0, -1);
        return;
      }

      if (event.key === 'ArrowRight') {
        this.moveCursor(0, 1);
        return;
      }

      if (event.key === 'ArrowUp') {
        this.moveCursor(-1, 0);
        return;
      }

      if (event.key === 'ArrowDown') {
        this.moveCursor(1, 0);
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        this.submitTurn();
        return;
      }

      if (key === '*') {
        this.discardHand();
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        this.removeLastPlacedTile();
        return;
      }

      if (event.key === ' ') {
        event.preventDefault();
        this.toggleCursorDirection();
        return;
      }

      if (/^[A-Z]$/.test(key)) {
        this.placeLetter(key);
      }
    });
  }

  moveCursor(deltaRow, deltaCol) {
    this.setCursor(this.cursorRow + deltaRow, this.cursorCol + deltaCol);
  }

  setCursor(row, col) {
    this.cursorRow = Phaser.Math.Clamp(row, 0, BOARD_SIZE - 1);
    this.cursorCol = Phaser.Math.Clamp(col, 0, BOARD_SIZE - 1);

    this.cursor.x = this.boardX + this.cursorCol * TILE_SIZE;
    this.cursor.y = this.boardY + this.cursorRow * TILE_SIZE;
  }

  placeLetter(letter) {

    if (this.modal || this.isGameOver) {
      return;
    }

    if (this.board[this.cursorRow][this.cursorCol]) {
      this.statusText.setText('This square is already occupied.');
      return;
    }

    if (!this.wouldKeepStraightLine(this.cursorRow, this.cursorCol)) {
      this.statusText.setText('Tiles placed this turn must form a straight line.');
      return;
    }

    const handIndex = this.hand.findIndex((tile) => tile.letter === letter);

    if (handIndex === -1) {
      this.statusText.setText(`You do not have ${letter} in your hand.`);
      return;
    }

    const tileModel = this.hand.splice(handIndex, 1)[0];
    const visualTile = this.createTile(tileModel, this.cursorRow, this.cursorCol);

    this.board[this.cursorRow][this.cursorCol] = visualTile;
    this.placedThisTurn.push(visualTile);

    this.renderHand();

    this.statusText.setText(`Placed ${letter}.`);

    if (this.cursorDirection === 'horizontal') {
      this.moveCursor(0, 1);
    } else {
      this.moveCursor(1, 0);
    }
  }

  createTile(tile, row, col) {
    const x = this.boardX + col * TILE_SIZE;
    const y = this.boardY + row * TILE_SIZE;

    const container = this.createVisualTile(tile, x, y, true);

    container.boardRow = row;
    container.boardCol = col;
    container.isLocked = false;

    // Elevated current-turn look
    container.setDepth(5);
    container.y -= 4;

    return container;
  }

  createVisualTile(tile, x, y, isCurrentTurn = false) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(
      0,
      0,
      TILE_SIZE - 2,
      TILE_SIZE - 2,
      isCurrentTurn ? 0xfef3c7 : 0xf8fafc
    ).setOrigin(0);

    if (isCurrentTurn) {
      bg.setStrokeStyle(2, 0xfacc15);
    }

    const letterText = this.add.text(8, 4, tile.letter, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#020617'
    });

    const valueText = this.add.text(25, 22, String(tile.score), {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#020617'
    });

    container.add([bg, letterText, valueText]);

    container.tile = tile;
    container.letter = tile.letter;
    container.value = tile.score;

    return container;
  }

  removeLastPlacedTile() {
    const visualTile = this.placedThisTurn.pop();

    if (!visualTile) {
      this.statusText.setText('No current-turn tile to erase.');
      return;
    }

    this.board[visualTile.boardRow][visualTile.boardCol] = null;
    this.hand.push(visualTile.tile);
    visualTile.destroy();

    this.renderHand();
    this.statusText.setText('Last tile erased.');
  }

  hasLockedTiles() {
    for (const row of this.board) {
      for (const tile of row) {
        if (tile?.isLocked) return true;
      }
    }

    return false;
  }

  isAdjacentToLockedTile(row, col) {
    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1]
    ];

    return neighbors.some(([r, c]) => {
      return (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        this.board[r][c]?.isLocked
      );
    });
  }

  animateValidatedTiles() {
    for (const visualTile of this.placedThisTurn) {
      visualTile.isLocked = true;

      this.tweens.add({
        targets: visualTile,
        y: this.boardY + visualTile.boardRow * TILE_SIZE,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        ease: 'Back.easeOut'
      });

      const bg = visualTile.list[0];
      bg.setFillStyle(0xf8fafc);
      bg.setStrokeStyle(0);
      visualTile.setDepth(1);
    }
  }

  turnTouchesLockedTile() {
    return this.placedThisTurn.some((tile) =>
      this.isAdjacentToLockedTile(tile.boardRow, tile.boardCol)
    );
  }

  recallTiles() {
    for (const visualTile of this.placedThisTurn) {
      this.board[visualTile.boardRow][visualTile.boardCol] = null;
      this.hand.push(visualTile.tile);
      visualTile.destroy();
    }

    this.placedThisTurn = [];
    this.renderHand();
    this.statusText.setText('Current turn recalled.');
  }

  getTurnDirection() {
    if (this.placedThisTurn.length < 2) {
      return this.cursorDirection;
    }

    const rows = new Set(this.placedThisTurn.map((tile) => tile.boardRow));
    const cols = new Set(this.placedThisTurn.map((tile) => tile.boardCol));

    if (rows.size === 1) return 'horizontal';
    if (cols.size === 1) return 'vertical';

    return 'invalid';
  }

  wouldKeepStraightLine(row, col) {
    const virtualTiles = [
      ...this.placedThisTurn,
      { boardRow: row, boardCol: col }
    ];

    if (virtualTiles.length < 2) {
      return true;
    }

    if (this.cursorDirection === 'horizontal') {
      return virtualTiles.every((tile) => tile.boardRow === virtualTiles[0].boardRow);
    }

    return virtualTiles.every((tile) => tile.boardCol === virtualTiles[0].boardCol);
  }

  discardHand() {
    if (this.discardsLeft <= 0) {
      this.statusText.setText('No discards left.');
      return;
    }

    if (this.placedThisTurn.length > 0) {
      this.statusText.setText('Erase or submit placed tiles before discarding.');
      return;
    }

    this.bag.push(...this.hand);
    this.bag = Phaser.Utils.Array.Shuffle(this.bag);

    this.hand = [];
    this.discardsLeft -= 1;

    this.dealHand();
    this.updateRoundUi();

    this.statusText.setText('Hand discarded.');
  }

  submitTurn() {

    if (this.modal || this.isGameOver) {
      return;
    }

    if (this.placedThisTurn.length === 0) {
      this.statusText.setText('Place at least one tile.');
      return;
    }

    const direction = this.getTurnDirection();

    if (direction === 'invalid') {
      this.statusText.setText('Tiles must be placed in a straight line.');
      return;
    }

    const boardAlreadyHasLockedTiles = this.hasLockedTiles();

    if (!boardAlreadyHasLockedTiles) {
      const usesCenter = this.placedThisTurn.some(
        (tile) => tile.boardRow === 7 && tile.boardCol === 7
      );

      if (!usesCenter) {
        this.statusText.setText('The first word must use the center square.');
        return;
      }
    }

    if (boardAlreadyHasLockedTiles && !this.turnTouchesLockedTile()) {
      this.statusText.setText('Your word must connect to existing tiles.');
      return;
    }

    const wordInfo = this.getMainWord();

    if (!wordInfo) {
      this.statusText.setText('Could not read a valid word.');
      return;
    }

    const { word, score } = wordInfo;

    if (!this.dictionary.has(word)) {
      this.statusText.setText(`"${word}" is not in the dictionary.`);
      return;
    }

    this.animateValidatedTiles();

    this.placedThisTurn = [];
    this.roundScore += score;
    this.totalScore += score;
    this.turnsLeft -= 1;

    this.dealHand();
    this.updateRoundUi();

    this.statusText.setText(`Accepted: ${word} (+${score})`);

    this.checkRoundState();
  }

  checkRoundState() {
    if (this.roundScore >= this.getCurrentRoundTarget()) {
      this.completeRound();
      return;
    }

    if (this.turnsLeft <= 0) {
      this.showGameOverWindow();
    }
  }

  completeRound() {
    this.isRoundOver = true;

    this.showModal({
      title: 'Round complete!',
      body: `You reached ${this.roundScore}/${this.getCurrentRoundTarget()} points.`,
      buttonText: 'Next round',
      onConfirm: () => this.startNextRound()
    });
  }

  startNextRound() {
    this.closeModal();

    this.roundIndex += 1;

    if (this.roundIndex >= ROUND_TARGETS.length) {
      this.showModal({
        title: 'You won!',
        body: `You completed all rounds.\nFinal score: ${this.totalScore}`,
        buttonText: 'Restart',
        onConfirm: () => this.restartGame()
      });
      return;
    }

    this.roundScore = 0;
    this.turnsLeft = this.maxTurnsPerRound;
    this.discardsLeft = this.maxDiscardsPerRound;
    this.isRoundOver = false;

    this.updateRoundUi();

    this.statusText.setText(
      `Round ${this.roundIndex + 1}. Target: ${this.getCurrentRoundTarget()}`
    );
  }

  showGameOverWindow() {
    this.isGameOver = true;

    this.showModal({
      title: 'Game over',
      body: `You scored ${this.roundScore}/${this.getCurrentRoundTarget()} this round.\nTotal score: ${this.totalScore}`,
      buttonText: 'Restart',
      onConfirm: () => this.restartGame()
    });
  }

  showModal({ title, body, buttonText, onConfirm }) {
    this.input.keyboard.enabled = false;

    this.modalConfirm = onConfirm;

    this.modal = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2
    );

    const overlay = this.add.rectangle(
      0,
      0,
      this.scale.width,
      this.scale.height,
      0x020617,
      0.78
    ).setOrigin(0.5);

    const panel = this.add.rectangle(
      0,
      0,
      420,
      250,
      0x0f172a
    )
      .setStrokeStyle(2, 0x38bdf8)
      .setOrigin(0.5);

    const titleText = this.add.text(0, -80, title, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#f8fafc'
    }).setOrigin(0.5);

    const bodyText = this.add.text(0, -25, body, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: 340 }
    }).setOrigin(0.5);

    const button = this.add.text(0, 70, buttonText, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#020617',
      backgroundColor: '#7dd3fc',
      padding: { x: 18, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      this.modalConfirm?.();
    });

    this.modal.add([overlay, panel, titleText, bodyText, button]);
    this.modal.setDepth(1000);
  }

  closeModal() {
    if (this.modal) {
      this.modal.destroy(true);
      this.modal = null;
    }

    this.modalConfirm = null;
    this.input.keyboard.enabled = true;
  }

  restartGame() {
    this.closeModal();
    this.scene.restart();
  }

  getMainWord() {
    if (this.placedThisTurn.length === 0) {
      return null;
    }

    const direction = this.getTurnDirection();

    if (direction === 'invalid') {
      return null;
    }

    const horizontal = direction === 'horizontal';
    const firstTile = this.placedThisTurn[0];

    let startRow = firstTile.boardRow;
    let startCol = firstTile.boardCol;

    const deltaRow = horizontal ? 0 : 1;
    const deltaCol = horizontal ? 1 : 0;

    while (
      startRow - deltaRow >= 0 &&
      startCol - deltaCol >= 0 &&
      this.board[startRow - deltaRow][startCol - deltaCol]
    ) {
      startRow -= deltaRow;
      startCol -= deltaCol;
    }

    let word = '';

    let row = startRow;
    let col = startCol;

    let rawScore = 0;
    let wordMultiplier = 1;

    while (
      row < BOARD_SIZE &&
      col < BOARD_SIZE &&
      this.board[row][col]
    ) {
      const visualTile = this.board[row][col];
      const cell = this.grid.getCell(row, col);

      word += visualTile.tile.letter;

      if (visualTile.isLocked) {
        rawScore += visualTile.tile.score;
      } else {
        rawScore += visualTile.tile.score * cell.letterMultiplier;
        wordMultiplier *= cell.wordMultiplier;
      }

      row += deltaRow;
      col += deltaCol;
    }

    const score = rawScore * wordMultiplier;

    return { word, score };
  }
}

let game = null;

export function startScrabble(parentId) {
  if (game) {
    game.destroy(true);
    game = null;
  }

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentId,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#020617',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: ScrabbleScene
  });

  return game;
}