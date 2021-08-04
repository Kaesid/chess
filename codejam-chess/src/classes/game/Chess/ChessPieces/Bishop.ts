import { ChessPiece } from './ChessPiece';

export class Bishop extends ChessPiece {
  public figure = 'bishop';

  generateMoves(): void {
    this.getBishopMoves();
  }
}
