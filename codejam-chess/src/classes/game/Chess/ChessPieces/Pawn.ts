import { ChessPiece } from './ChessPiece';

export class Pawn extends ChessPiece {
  public figure = 'pawn';

  public generateMoves(): void {
    let isAbilityActive = false;

    if ((this.isWhite && +this.numbers[this.numPos] === 2) || (!this.isWhite && +this.numbers[this.numPos] === 7)) {
      isAbilityActive = true;
    }

    this.getPawnMoves(isAbilityActive);
  }

  private getPawnMoves(isAbilityActive: boolean): void {
    this.resetFlags();

    const positiveAxisMove = 1;

    const negativeAxisMove = -1;

    const positiveAxisMoveSkill = 2;

    const negativeAxisMoveSkill = -2;

    if (this.isWhite) {
      this.addMove(0, positiveAxisMove);
    } else {
      this.addMove(0, negativeAxisMove);
    }

    if (isAbilityActive) {
      if (this.isWhite) {
        this.addMove(0, positiveAxisMoveSkill);
      } else {
        this.addMove(0, negativeAxisMoveSkill);
      }
    }
  }
}
