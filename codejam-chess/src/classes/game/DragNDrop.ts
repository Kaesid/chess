import { ISquareParams } from '../../intefaces';
import { getSquareCoord } from '../../store';
import { Render } from '../render/Render';
import { ChessLogic } from './Chess/ChessLogic';

export class DragNdrop {
  render: Render;

  private readonly chess: ChessLogic;

  private shiftX = 0;

  private shiftY = 0;

  private initX = 0;

  private initY = 0;

  private initSquare: HTMLElement = document.createElement('div');

  private initSquareCoord = '';

  constructor(render: Render, chess: ChessLogic) {
    this.render = render;

    this.chess = chess;
  }

  public handleDragNDrop(event: MouseEvent): void {
    this.chess.data.activePieceHTML = event.target as HTMLImageElement;

    if (!this.isValidFigure()) {
      return;
    }

    this.resetData();

    this.setListeners();

    this.showPieceMoves();

    this.dragNDrop(event);
  }

  public async putPieceOnBoard(event: MouseEvent): Promise<void> {
    this.chess.data.activePieceHTML.hidden = true;

    const elemBelow = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;

    if (this.isMoveLegit(elemBelow) && this.render.game.isActiveWhite === this.isActivePieceWhite()) {
      await this.makeTurn(elemBelow);
    } else {
      this.undoTurn(elemBelow);
    }
  }

  private setListeners(): void {
    document.body.onmousemove = e => this.dDMove(e);

    document.body.onmouseup = e => this.putPieceOnBoard(e);

    document.body.ondragstart = e => e.preventDefault();
  }

  private isValidFigure(): boolean {
    return !!(this.chess.data.activePieceHTML.parentElement as HTMLElement).dataset.letter;
  }

  private showPieceMoves(): void {
    this.initSquare = this.chess.data.activePieceHTML.parentElement as HTMLElement;

    this.initSquareCoord = getSquareCoord(this.initSquare);

    this.chess.findPiece(this.initSquareCoord);
  }

  private dragNDrop(event: MouseEvent): void {
    this.initX = this.chess.data.activePieceHTML.getBoundingClientRect().left;
    this.initY = this.chess.data.activePieceHTML.getBoundingClientRect().top;

    this.shiftX = event.clientX - this.initX;
    this.shiftY = event.clientY - this.initY;

    document.body.append(this.chess.data.activePieceHTML);

    this.dDMove(event);
  }

  private isMoveLegit(targetElem: HTMLElement): boolean {
    const isItSquare = Boolean(targetElem.dataset.letter);

    const isPieceAttackMode = Boolean(targetElem.classList.contains('game__field__square__piece'));

    const isItNotSameSquare = Boolean(this.initSquare !== targetElem);

    const isMoveLegit = this.chess.ismoveLegit(getSquareCoord(targetElem));

    return (isItSquare || isPieceAttackMode) && isItNotSameSquare && isMoveLegit;
  }

  private async checkShouldBoardRotate(): Promise<void> {
    if (this.render.lobby.IsLocalGame() && this.chess.data.isBoardShouldRotate && !this.chess.data.isGameFinished) {
      await this.render.game.rotateBoard();

      if (this.chess.data.checkMateSquares.king) {
        this.chess.effects.showKingsCheck();
      }
    }
    if (this.render.lobby.IsLocalGame()) {
      this.chess.data.isBoardShouldRotate = true;
    }
  }

  private isActivePieceWhite(): boolean {
    return this.chess.data.activePieceHTML.alt.split(' ')[0] === 'white';
  }

  private async makeTurn(elem: HTMLElement): Promise<void> {
    const square = getSquareCoord(elem);

    this.chess.ui.removeAttackedPiece(square);

    this.putPiece(square);

    this.resetData();

    await this.chess.updateGameData(square);

    await this.checkShouldBoardRotate();
  }

  private undoTurn(elem: HTMLElement): void {
    this.chess.data.isNewTurn = false;

    const square = getSquareCoord(this.initSquare);

    const initElem = this.chess.data.getSquareData(square);

    this.checkAdvanceTurn(elem);

    this.pieceSelectionForMouseClickControl(initElem);

    this.putPiece(square);

    this.resetData();
  }

  private checkAdvanceTurn(elem: HTMLElement): void {
    if (this.isMoveLegit(elem) && this.chess.data.isAdvanceTurn) {
      this.chess.data.isAdvanceTurn = false;

      this.chess.data.isAdvanceTurnMade = true;

      const from = getSquareCoord(this.initSquare);

      const to = getSquareCoord(elem);

      this.chess.data.storedSquareForAdvanceTurn = `${from}${to}`;

      this.chess.effects.showAdvanceMove(to);

      this.chess.effects.resetHighlight();
    }
  }

  private pieceSelectionForMouseClickControl(initElem: ISquareParams | null): void {
    if (!initElem && !this.chess.data.isAdvanceTurn) {
      this.chess.data.isPiecesSelected = true;
    }

    if (!initElem && this.chess.data.isAdvanceTurn) {
      this.chess.data.isAdvanceTurnPieceSelected = true;
    }

    if (initElem && this.chess.data.isPiecesSelected) {
      this.chess.effects.resetHighlight();

      this.chess.data.isPiecesSelected = false;
    }

    if (initElem && this.chess.data.isAdvanceTurnPieceSelected) {
      this.chess.effects.resetHighlight();

      this.chess.data.isAdvanceTurnPieceSelected = false;
    }
  }

  private putPiece(square: string): void {
    this.chess.data.activePieceHTML.hidden = false;

    this.render.game.squares[square].appendChild(this.chess.data.activePieceHTML);
  }

  private resetData(): void {
    this.chess.data.activePieceHTML.style.left = '';

    this.chess.data.activePieceHTML.style.top = '';

    document.body.onmousemove = null;

    document.body.onmouseup = null;
  }

  private dDMove(event: MouseEvent): void {
    this.chess.data.activePieceHTML.style.left = `${event.pageX - this.shiftX}px`;

    this.chess.data.activePieceHTML.style.top = `${event.pageY - this.shiftY}px`;
  }
}
