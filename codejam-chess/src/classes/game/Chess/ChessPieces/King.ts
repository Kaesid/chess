import { ChessPiece } from './ChessPiece';

export class King extends ChessPiece {
  public figure = 'king';

  public generateMoves(): void {
    this.getKingMoves();
  }

  private getKingMoves(): void {
    const axisStart = -1;

    const axisLimit = 1;

    for (let x = axisStart; x <= axisLimit; x++) {
      for (let y = axisStart; y <= axisLimit; y++) {
        if (x || y) {
          this.resetFlags();

          this.addMove(x, y);
        }
      }
    }
  }
}
