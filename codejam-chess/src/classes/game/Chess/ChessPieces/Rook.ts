import { ChessPiece } from './ChessPiece';

export class Rook extends ChessPiece {
  public figure = 'rook';

  public generateMoves(): void {
    this.getRookMoves();
  }
}
