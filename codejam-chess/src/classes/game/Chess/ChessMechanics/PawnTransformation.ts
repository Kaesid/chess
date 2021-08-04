import { Render } from '../../../render/Render';
import { ChessDataHandler } from '../ChessData/ChessDataHandler';

export class PawnTransformation {
  private readonly render: Render;

  private readonly data: ChessDataHandler;

  private pawn: HTMLImageElement = document.createElement('img');

  constructor(render: Render, data: ChessDataHandler) {
    this.render = render;
    this.data = data;
  }

  public checkIsPawnShouldTransform(square: string, isSimulation = false): void {
    const number = +square.split('')[1];

    if (number === 1 || number === 8) {
      const pieceWithSquare = this.data.getSquareData(square);

      if (pieceWithSquare) {
        this.pawn = pieceWithSquare.piece.HTML;

        this.data.evolvePawnSquare = square;

        this.transformPawn(isSimulation);

        this.data.isPawnShouldEvolve = true;
      }
    }
  }

  private transformPawn(isSimulation = false): void {
    if (!isSimulation && !this.data.isAIEvaluationMode) {
      const color = this.pawn.alt.split(' ')[0];

      const queen = {
        ...this.render.game.piecesDOMSet[color].queen,
        parent: this.pawn.parentElement as HTMLElement,
      };

      this.pawn.parentElement?.firstElementChild?.remove();

      this.pawn = this.render.game.createQueen(queen);
    }
  }
}
