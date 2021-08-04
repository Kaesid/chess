import { ISquareParams } from "../../../../intefaces";
import { getSquares } from '../../../../store';
import { Render } from '../../../render/Render';
import { ChessDataHandler } from '../ChessData/ChessDataHandler';

export class ChessExternalControl {
  private readonly render: Render;

  private readonly data: ChessDataHandler;

  private initSquare = '';

  private finalSquare = '';

  private finalHTML: HTMLElement | null = null;

  constructor(render: Render, data: ChessDataHandler) {
    this.render = render;
    this.data = data;
  }

  public removeAttackedPiece(inputSquare: string): void {
    const square = this.data.getSquareData(inputSquare);

    if (square) {
      if (square.arrIndex !== -1) {
        this.render.game.piecesPosition[square.piece.color][square.piece.figure].splice(square.arrIndex, 1);
      }

      square.piece.HTML.remove();
    }
  }

  public async movePiece(squares: string): Promise<void> {
    this.setSquares(squares);

    if (this.isMoveCoordsLegit()) {
      this.removeAttackedPiece(this.finalSquare);

      await this.setNewPositions();
    }

    this.resetSquaresData();
  }

  private isMoveCoordsLegit(): boolean {
    const init = this.data.getSquareData(this.initSquare);

    const final = this.data.getSquareData(this.finalSquare);

    if (init && this.finalHTML && (!final || init.piece.color !== final.piece.color)) {
      return true;
    }
    return false;
  }

  private setSquares(squares: string): void {
    [this.initSquare, this.finalSquare] = getSquares(squares);

    this.finalHTML = this.render.game.squares[this.finalSquare];
  }

  private resetSquaresData(): void {
    this.finalHTML = null;
  }

  private setNewPositions(): Promise<void> {
    return new Promise(resolve => {
      const square = this.data.getSquareData(this.initSquare);

      const animationDuration = 500;

      if (square) {
        if (square.arrIndex !== -1) {
          this.render.game.piecesPosition[square.piece.color][square.piece.figure][square.arrIndex] = this.finalSquare;
        }

        this.setAnimation(square);

        setTimeout(() => {
          this.resetAnimation(square);
          resolve();
        }, animationDuration);
      }
    });
  }

  private setAnimation(square: ISquareParams): void {
    const initX = square.piece.HTML.getBoundingClientRect().left;

    const initY = square.piece.HTML.getBoundingClientRect().top;

    this.render.game.gameField.classList.add('no-touch');

    document.body.appendChild(square.piece.HTML);

    square.piece.HTML.style.left = `${initX}px`;

    square.piece.HTML.style.top = `${initY}px`;

    square.piece.HTML.classList.add('animation');

    const squareX = this.render.game.squares[this.finalSquare].getBoundingClientRect().left;

    const squareY = this.render.game.squares[this.finalSquare].getBoundingClientRect().top;

    square.piece.HTML.style.left = `${squareX}px`;

    square.piece.HTML.style.top = `${squareY}px`;
  }

  private resetAnimation(square: ISquareParams): void {
    this.render.game.squares[this.finalSquare].appendChild(square.piece.HTML);

    square.piece.HTML.style.left = ``;

    square.piece.HTML.style.top = ``;

    square.piece.HTML.classList.remove('animation');

    this.render.game.gameField.classList.remove('no-touch');
  }
}
