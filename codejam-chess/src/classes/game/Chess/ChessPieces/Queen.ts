import { ChessPiece } from './ChessPiece';

export class Queen extends ChessPiece {
  public figure = 'queen';

  public generateMoves(): void {
    this.getBishopMoves();

    this.getRookMoves();
  }
}
