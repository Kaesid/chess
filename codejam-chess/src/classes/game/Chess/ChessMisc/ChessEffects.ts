import { IPieceInfo } from '../../../../intefaces';
import { Render } from '../../../render/Render';
import { ChessDataHandler } from '../ChessData/ChessDataHandler';

export class ChessEffects {
  private readonly render: Render;

  private readonly data: ChessDataHandler;

  private isEffectsOn = false;

  constructor(render: Render, data: ChessDataHandler) {
    this.render = render;
    this.data = data;
  }

  public showMoves(piece: IPieceInfo): void {
    this.showMovement(piece);

    this.showAttacks(piece);

    this.isEffectsOn = true;
  }

  public resetHighlight(): void {
    if (this.isEffectsOn) {
      this.hideMoves(this.data.piece);

      this.hideAttacks(this.data.piece);

      this.isEffectsOn = false;
    }
  }

  public resetCheckHighlight(): void {
    if (this.data.checkMateSquares.king) {
      this.hideKingsCheck();
    }
  }

  public showAdvanceMove(square: string): void {
    this.render.game.squares[square].classList.add('square-wrap-advanvce-move');
  }

  public removeAdvanceMove(square: string): void {
    this.render.game.squares[square].classList.remove('square-wrap-advanvce-move');
  }

  public showKingsCheck(): void {
    this.render.game.squares[this.data.checkMateSquares.king].classList.add('square-wrap-check-king');
    this.render.game.squares[this.data.checkMateSquares.attacker].classList.add('square-wrap-check-attacker');
  }

  public handleCheckmate(): void {
    this.render.game.gameField.classList.add('inactive');

    this.resetCheckHighlight();

    this.showCheckmate();
  }

  public handleStalemate(): void {
    this.render.game.gameField.classList.add('inactive');

    this.data.checkMateSquares.king = this.data.piece.square;

    this.showStalemate();
  }

  private showMovement(piece: IPieceInfo): void {
    piece.actions.uiMoves.forEach(square => {
      // console.log(this.render.game.squares[square]);
      this.render.game.squares[square].classList.add('square-wrap-move');
    });
  }

  private hideMoves(piece: IPieceInfo): void {
    piece.actions.uiMoves.forEach(square => {
      // console.log(this.render.game.squares[square]);
      this.render.game.squares[square].classList.remove('square-wrap-move');
    });
  }

  private showAttacks(piece: IPieceInfo): void {
    piece.actions.attacks.forEach(square => {
      // console.log(this.render.game.squares[square]);
      this.render.game.squares[square].classList.add('square-wrap-attack');
    });
  }

  private hideAttacks(piece: IPieceInfo): void {
    piece.actions.attacks.forEach(square => {
      // console.log(this.render.game.squares[square]);
      this.render.game.squares[square].classList.remove('square-wrap-attack');
    });
  }

  private showCheckmate(): void {
    this.render.game.squares[this.data.checkMateSquares.king].classList.add('square-wrap-checkmate-king');
    this.render.game.squares[this.data.checkMateSquares.attacker].classList.add('square-wrap-checkmate-attacker');
  }

  private showStalemate(): void {
    this.render.game.squares[this.data.checkMateSquares.king].classList.add('square-wrap-stalemate-king');
  }

  private hideKingsCheck(): void {
    this.render.game.squares[this.data.checkMateSquares.king].classList.remove('square-wrap-check-king');
    this.render.game.squares[this.data.checkMateSquares.attacker].classList.remove('square-wrap-check-attacker');
  }
}
