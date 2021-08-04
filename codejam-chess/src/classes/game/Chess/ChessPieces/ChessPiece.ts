import { ISquaresActions, ISquaresSet } from '../../../../intefaces';
import { ChessDataHandler } from '../ChessData/ChessDataHandler';

export class ChessPiece {
  private readonly data: ChessDataHandler;

  private actions: ISquaresActions = {
    moves: [],
    attacks: [],
    uiMoves: [],
    potentialAttacks: [],
  };

  public figure = 'template';

  public letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  public numbers: string[] = ['1', '2', '3', '4', '5', '6', '7', '8'];

  private curNum = ``;

  private curLetter = '';

  private letterPos = 0;

  public numPos = 0;

  public isWhite = true;

  private occupiedSquares: ISquaresSet = {
    white: [],
    black: [],
    all: [],
  };

  private isPotentialMoveOK = true;

  private isPotentialAttackOK = true;

  constructor(data: ChessDataHandler) {
    this.data = data;
  }

  private getPiecesPostion(): void {
    if (this.data.isSuicideKingPreventionMode()) {
      this.occupiedSquares = JSON.parse(JSON.stringify(this.data.potentiallyOccupiedSquares));
    } else {
      this.occupiedSquares = JSON.parse(JSON.stringify(this.data.occupiedSquares));
    }
  }

  public getActions(square: string, isWhite: boolean): ISquaresActions {
    this.isWhite = isWhite;

    this.getPiecesPostion();

    this.resetMoves();

    const correctSquareLength = 2;

    if (square && square.length === correctSquareLength) {
      this.getCoords(square);

      this.generateMoves();

      this.actions.moves = [...this.actions.uiMoves];
    }

    return this.actions;
  }

  public generateMoves(): void {
    this.resetMoves();
  }

  public getRookMoves(): void {
    this.resetFlags();

    const axisPositiveStart = 1;

    const axisPositiveLimit = 8;

    const axisNegativeStart = -1;

    const axisNegativeLimit = -8;

    for (let i = axisNegativeStart; i > axisNegativeLimit; i--) {
      this.addMove(i, 0);
    }

    this.resetFlags();

    for (let i = axisNegativeStart; i > axisNegativeLimit; i--) {
      this.addMove(0, i);
    }

    this.resetFlags();

    for (let i = axisPositiveStart; i < axisPositiveLimit; i++) {
      this.addMove(i, 0);
    }

    this.resetFlags();

    for (let i = axisPositiveStart; i < axisPositiveLimit; i++) {
      this.addMove(0, i);
    }
  }

  public getBishopMoves(): void {
    this.resetFlags();

    const axisPositiveStart = 1;

    const axisNegativeStart = -1;

    const axisPositiveLimit = 8;

    const axisNegativeLimit = -8;

    for (let i = axisNegativeStart; i > axisNegativeLimit; i--) {
      this.addMove(i, i);
    }

    this.resetFlags();

    for (let i = axisNegativeStart; i > axisNegativeLimit; i--) {
      this.addMove(i, -i);
    }

    this.resetFlags();

    for (let i = axisPositiveStart; i < axisPositiveLimit; i++) {
      this.addMove(i, i);
    }

    this.resetFlags();

    for (let i = axisPositiveStart; i < axisPositiveLimit; i++) {
      this.addMove(i, -i);
    }
  }

  public resetFlags(): void {
    this.isPotentialMoveOK = true;
    this.isPotentialAttackOK = true;
  }

  public addMove(x: number, y: number): void {
    if (this.isSquareExist(x, y)) {
      this.pawnAttackCheck(x, y);

      const square = this.getSquare(x, y);

      this.checkIsOkToMove(square);

      if (this.isPotentialMoveOK) {
        this.actions.uiMoves.push(square);
      }

      if (this.isPotentialAttackOK && this.figure !== 'pawn') {
        this.actions.potentialAttacks.push(square);
      }
    }
  }

  private resetMoves(): void {
    this.actions.uiMoves = [];

    this.actions.attacks = [];

    this.actions.potentialAttacks = [];

    this.actions.moves = [];
  }

  private getCoords(square: string): void {
    [this.curLetter, this.curNum] = square.split('');

    this.letterPos = this.letters.indexOf(this.curLetter);

    this.numPos = this.numbers.indexOf(this.curNum);
  }

  private pawnAttackCheck(x: number, y: number): void {
    if (this.figure === 'pawn' && Math.abs(y) === 1) {
      if (this.isSquareExist(x + 1, y)) {
        this.checkAttack(this.getSquare(x + 1, y));

        this.actions.potentialAttacks.push(this.getSquare(x + 1, y));
      }

      if (this.isSquareExist(x - 1, y)) {
        this.checkAttack(this.getSquare(x - 1, y));

        this.actions.potentialAttacks.push(this.getSquare(x - 1, y));
      }
    }
  }

  private checkIsOkToMove(targetSquare: string): void {
    if (this.isPotentialMoveOK || this.isPotentialAttackOK) {
      this.occupiedSquares.all.forEach(square => {
        if (square === targetSquare) {
          if (square !== this.data.squareToIgnore) {
            this.isPotentialAttackOK = false;
          }

          if (this.isPotentialMoveOK && this.figure !== 'pawn') {
            this.checkAttack(targetSquare);
          }

          this.isPotentialMoveOK = false;
        }
      });
    }
  }

  private isSquareExist(x: number, y: number): boolean {
    return Boolean(this.letters[this.letterPos + x] && this.numbers[this.numPos + y]);
  }

  private getSquare(x: number, y: number): string {
    return `${this.letters[this.letterPos + x]}${this.numbers[this.numPos + y]}`;
  }

  private getEnemySquare(enemyOccupiedSquares: string[], targetSquare: string): void {
    enemyOccupiedSquares.forEach(square => {
      if (square === targetSquare) {
        this.actions.attacks.push(square);
      }
    });
  }

  private checkAttack(targetSquare: string): void {
    if (this.isWhite) {
      this.getEnemySquare(this.occupiedSquares.black, targetSquare);
    } else {
      this.getEnemySquare(this.occupiedSquares.white, targetSquare);
    }
  }
}
