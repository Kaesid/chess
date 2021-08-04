import { ChessPiece } from './ChessPiece';

export class Knight extends ChessPiece {
  public figure = 'knight';

  public generateMoves(): void {
    this.getKnightMoves();
  }

  private getKnightMoves(): void {
    const axisStart = -2;

    const axisLimit = 2;

    const moveLength = 3;

    for (let x = axisStart; x <= axisLimit; x++) {
      for (let y = axisStart; y <= axisLimit; y++) {
        this.resetFlags();

        if (Math.abs(x) + Math.abs(y) === moveLength) {
          this.addMove(x, y);
        }
      }
    }
  }
}
