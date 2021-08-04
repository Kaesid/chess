import { IMessage, ISquareParams } from '../../intefaces';
import store, { getSquareCoord, goToLobby, goToReplaysPage, getSeconds } from '../../store';
import { Render } from '../render/Render';
import { ChessDataHandler } from './Chess/ChessData/ChessDataHandler';
import { ChessLogic } from './Chess/ChessLogic';
import { DragNdrop } from './DragNDrop';

export class MatchGame {
  private readonly render: Render;

  private readonly dnd: DragNdrop;

  private readonly chess: ChessLogic;

  private readonly data: ChessDataHandler;

  private timeoutMove: NodeJS.Timeout | null = null;

  private timeoutGameEnd: NodeJS.Timeout | null = null;

  constructor(render: Render) {
    this.render = render;

    this.data = new ChessDataHandler(render);

    this.chess = new ChessLogic(this.render, this.data);

    this.dnd = new DragNdrop(this.render, this.chess);
  }

  public loadLogic(): void {
    this.startNewGame();
  }

  public resetGameDataOnGameFinish(): void {
    window.clearTimeout(this.timeoutMove as NodeJS.Timeout);

    window.clearTimeout(this.timeoutGameEnd as NodeJS.Timeout);

    this.data.isGameFinished = true;

    this.data.isNoLegalTurns = false;

    this.chess.data.timer.resetTime();

    if (this.render.lobby.IsServerGameMode() && this.data.socket?.readyState === 1 && !this.render.game.isReplayMode) {
      const msg: IMessage = {
        content: `player left game`,
        type: 'PlayerLeave',
      };

      this.data.socket?.send(JSON.stringify(msg));
    }
  }

  private async startNewGame(): Promise<void> {
    this.resetGameData();

    this.data.prepareBases();

    this.setListeners();

    this.chess.data.timer.setIncrementTimer();

    if (this.render.game.isReplayMode) {
      this.handleReplay();
    }

    await this.initiateAi();

    await this.chess.handleSocket();
  }

  private moveOnTime(i: number, time: number): Promise<void> {
    return new Promise(resolve => {
      store.isAnimationInProgress = true;

      const second = 1000;

      this.timeoutMove = setTimeout(() => {
        this.chess.movePieces(this.render.game.replayData.turns[i]).then(() => {
          store.isAnimationInProgress = false;

          resolve();
        });
      }, (second * time) / store.replayTimeSpeed);
    });
  }

  private pauseBeforeGameFinish(time: number): Promise<void> {
    return new Promise(resolve => {
      store.isAnimationInProgress = true;

      const second = 1000;

      this.timeoutGameEnd = setTimeout(() => {
        this.checkIfShouldShowPopup();

        store.isAnimationInProgress = false;

        resolve();
      }, (second * time) / store.replayTimeSpeed);
    });
  }

  private checkIfShouldShowPopup(): void {
    if (!this.data.isGameFinished) {
      this.checkGameEndReason();
    }
  }

  private checkGameEndReason(): void {
    if (!this.render.game.replayData.winner) {
      this.chess.gameFinishedByAgreement();
    } else {
      this.chess.gameFinishedByYield(this.render.game.replayData.winner);
    }
  }

  private checkRadioButtons(event: MouseEvent): void {
    const elem = event.target as HTMLElement;
    if (elem.classList.contains(`header__replay__speed-checkbox`) && elem.id) {
      store.replayTimeSpeed = +elem.id;

      this.chess.data.timer.timerRestartCheck();
    }
  }

  private setListeners(): void {
    document.body.onmousedown = e => this.checkTarget(e);

    this.resetButtonsActions();

    if (this.render.game.isReplayMode) {
      this.setReplaysListeners();
    } else {
      this.setGameListeners();
    }
  }

  private resetButtonsActions(): void {
    this.render.header.section.yieldButton.onclick = null;

    this.render.header.section.drawOfferButton.onclick = null;
  }

  private setReplaysListeners(): void {
    this.render.header.section.yieldButton.onclick = () => goToLobby();

    this.render.header.section.drawOfferButton.onclick = () => goToReplaysPage();

    this.render.header.section.speedWrap.onclick = e => this.checkRadioButtons(e);
  }

  private setGameListeners(): void {
    this.render.header.section.yieldButton.onclick = () => {
      this.chess.data.isPlayerYielded = true;
      this.chess.gameFinishedByYield();
    };

    this.render.header.section.drawOfferButton.onclick = () => {
      if (this.render.lobby.IsServerGameMode()) {
        this.chess.offerDraw(true);
      } else {
        this.chess.offerDraw();
      }
    };
  }

  private getActiveTeam(): string {
    return this.render.game.isActiveWhite ? 'white' : 'black';
  }

  private isPiecesAvailableByMode(squareWithPiece: ISquareParams): boolean {
    if (this.render.lobby.IsLocalGame()) {
      return true;
    } 
    return this.isPlayersPieces(squareWithPiece);
    
  }

  private isPlayersPieces(squareWithPiece: ISquareParams): boolean {
    let isPieceWhite = false;

    if (squareWithPiece.piece.color === 'white') {
      isPieceWhite = true;
    }

    return !!(this.render.game.isFirstPlayerWhite === isPieceWhite);
  }

  private isDragAvialable(squareWithPiece: ISquareParams | null): boolean {
    return !!(
      !this.data.isAdvanceTurnPieceSelected &&
      squareWithPiece &&
      this.getActiveTeam() === squareWithPiece.piece.color &&
      this.isPiecesAvailableByMode(squareWithPiece)
    );
  }

  private isCorrectModeForAdvanceTurn(squareWithPiece: ISquareParams): boolean {
    if (this.render.lobby.IsLocalGame()) {
      return true;
    } 
    return !!this.isPiecesAvailableByMode(squareWithPiece);
    
  }

  private isAdvanceTurnAvailable(squareWithPiece: ISquareParams | null): boolean {
    return !!(
      !this.data.isPiecesSelected &&
      squareWithPiece &&
      this.getActiveTeam() !== squareWithPiece.piece.color &&
      !this.data.isAdvanceTurnMade &&
      this.isCorrectModeForAdvanceTurn(squareWithPiece)
    );
  }

  private async initiateAi(): Promise<void> {
    if (this.render.lobby.IsAIGameMode() && !this.render.game.isFirstPlayerWhite) {
      this.chess.newTurnActions();

      await this.chess.findBestAITurn();
    }
  }

  private async handleReplay(): Promise<void> {
    this.render.lobby.selectSet.gameMode.value = 'local';

    let timeSum = 0;

    // Поскольку мне нужно, чтобы анимация ходов шла последовательно,
    // в данном случае используется цикл for вместо ForEach

    for (let i = 0; i < this.render.game.replayData.turns.length; i++) {
      this.data.realtimes[i] = getSeconds(this.render.game.replayData.turnsTime[i]) - timeSum;

      timeSum += this.data.realtimes[i];

      await this.moveOnTime(i, this.data.realtimes[i]);
    }

    const timeBeforeGameEnd = getSeconds(this.render.game.replayData.gameTime) - timeSum;

    if (timeBeforeGameEnd > 0) {
      await this.pauseBeforeGameFinish(timeBeforeGameEnd);
    } else {
      this.checkIfShouldShowPopup();
    }

    this.chess.setEndgameState();
  }

  private isMouseClickTurnAvailable(): boolean {
    return !!(
      (this.data.isPiecesSelected && !this.data.isAdvanceTurn) ||
      (this.data.isAdvanceTurnPieceSelected && this.data.isAdvanceTurn)
    );
  }

  private async checkTarget(event: MouseEvent): Promise<void> {
    const clickOn = event.target as HTMLImageElement;

    const squareCoords = getSquareCoord(clickOn);

    const squareWithPiece = this.chess.data.getSquareData(squareCoords);

    switch (true) {
      case this.isDragAvialable(squareWithPiece):
        this.dragMode(event);
        break;
      case this.isMouseClickTurnAvailable():
        await this.dnd.putPieceOnBoard(event);
        break;
      case this.isAdvanceTurnAvailable(squareWithPiece):
        this.advanceTurnMode(event);
        break;
      default:
    }
  }

  private dragMode(event: MouseEvent): void {
    this.data.isAdvanceTurn = false;
    this.dnd.handleDragNDrop(event);
  }

  private advanceTurnMode(event: MouseEvent): void {
    this.data.isAdvanceTurn = true;

    this.dnd.handleDragNDrop(event);
  }

  private resetGameData(): void {
    this.resetGameDataOnGameFinish();

    this.chess.castling.resetCastlingData();

    this.data.resetTurnData();

    this.data.resetGameData();
  }
}
