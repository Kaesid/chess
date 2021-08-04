import { IPiecesSetLoc } from '../../../../intefaces';
import { ChessDataHandler } from '../ChessData/ChessDataHandler';

export class ChessCastling {
  private readonly data: ChessDataHandler;

  private isAWhiteCastlingDisabled = false;

  private isHWhiteCastlingDisabled = false;

  private isABlackCastlingDisabled = false;

  private isHBlackCastlingDisabled = false;

  constructor(data: ChessDataHandler) {
    this.data = data;
  }

  public resetCastlingData(): void {
    this.isAWhiteCastlingDisabled = false;

    this.isHWhiteCastlingDisabled = false;

    this.isABlackCastlingDisabled = false;

    this.isHBlackCastlingDisabled = false;
  }

  public checkIfCastlingAvailable(piecesPositionSet: IPiecesSetLoc, isWhite: boolean): void {
    this.checkIfCastlingAvailableWhite(piecesPositionSet, isWhite);

    this.checkIfCastlingAvailableBlack(piecesPositionSet, isWhite);

    this.addCastlingMovesToKing();
  }

  public getCastlingMove(square: string): string {
    let rookMove = '';
    if (this.data.castling.isMovesAdded && this.data.piece.pieceName === 'king') {
      switch (square) {
        case 'C1':
          rookMove = 'a1d1';
          break;

        case 'G1':
          rookMove = 'h1f1';
          break;

        case 'C8':
          rookMove = 'a8d8';
          break;

        case 'G8':
          rookMove = 'h8f8';
          break;
        default:
      }
    }

    return rookMove;
  }

  private addCastlingMovesToKing(): void {
    this.addCastlingMovesToWhiteKing();

    this.addCastlingMovesToBlackKing();
  }

  private isSquareFree(square: string): boolean {
    return !this.data.occupiedSquares.all.includes(square);
  }

  private isKingCanMove(square: string): boolean {
    return this.data.piece.actions.uiMoves.indexOf(square) !== -1;
  }

  private checkSquares(fisrstSquare: string, finalSquare: string, longCastlingSquare?: string): void {
    if (
      this.isKingCanMove(fisrstSquare) &&
      this.isSquareFree(fisrstSquare) &&
      this.isSquareFree(finalSquare) &&
      (!longCastlingSquare || this.isSquareFree(longCastlingSquare))
    ) {
      this.data.piece.actions.uiMoves.push(finalSquare);

      this.data.castling.isMovesAdded = true;
      this.data.castlingSquare = finalSquare;
    }
  }

  private isBlackKingCanDoIt(): boolean {
    return !!(
      this.data.isGameMode() &&
      !this.data.piece.isWhite &&
      this.data.castling.isAvailableBlack &&
      !this.data.checkMateSquares.king
    );
  }

  private isWhiteKingCanDoIt(): boolean {
    return !!(
      this.data.isGameMode() &&
      this.data.piece.isWhite &&
      this.data.castling.isAvailableWhite &&
      !this.data.checkMateSquares.king
    );
  }

  private addCastlingMovesToWhiteKing(): void {
    if (this.isWhiteKingCanDoIt()) {
      if (!this.isAWhiteCastlingDisabled) {
        this.checkSquares('D1', 'C1', 'B1');
      }

      if (!this.isHWhiteCastlingDisabled) {
        this.checkSquares('F1', 'G1');
      }
    }
  }

  private addCastlingMovesToBlackKing(): void {
    if (this.isBlackKingCanDoIt()) {
      if (!this.isABlackCastlingDisabled) {
        this.checkSquares('D8', 'C8', 'B8');
      }

      if (!this.isHBlackCastlingDisabled) {
        this.checkSquares('F8', 'G8');
      }
    }
  }

  private checkIfCastlingAvailableWhite(piecesPositionSet: IPiecesSetLoc, isWhite: boolean): void {
    if (this.data.castling.isAvailableWhite && isWhite) {
      const kingLoc = piecesPositionSet.white.king[0];

      const rook1Loc = piecesPositionSet.white.rook[0];

      const rook2Loc = piecesPositionSet.white.rook[1];

      if (rook1Loc !== 'A1') {
        this.isAWhiteCastlingDisabled = true;
      }
      if (rook2Loc !== 'H1') {
        this.isHWhiteCastlingDisabled = true;
      }

      if (kingLoc !== 'E1' || (this.isAWhiteCastlingDisabled && this.isHWhiteCastlingDisabled)) {
        this.data.castling.isAvailableWhite = false;
      }
    }
  }

  private checkIfCastlingAvailableBlack(piecesPositionSet: IPiecesSetLoc, isWhite: boolean): void {
    if (this.data.castling.isAvailableBlack && !isWhite) {
      const kingLoc = piecesPositionSet.black.king[0];

      const rook1Loc = piecesPositionSet.black.rook[0];

      const rook2Loc = piecesPositionSet.black.rook[1];

      if (rook1Loc !== 'A8') {
        this.isABlackCastlingDisabled = true;
      }
      if (rook2Loc !== 'H8') {
        this.isHBlackCastlingDisabled = true;
      }

      if (kingLoc !== 'E8' || (this.isABlackCastlingDisabled && this.isHBlackCastlingDisabled)) {
        this.data.castling.isAvailableBlack = false;
      }
    }
  }
}
