import { IUpdatePieceData, ISquaresSet, IText, IMessage, IReplayData } from '../../../intefaces';

import { Render } from '../../render/Render';
import { Pawn } from './ChessPieces/Pawn';
import { Knight } from './ChessPieces/Knight';
import { Bishop } from './ChessPieces/Bishop';
import { Rook } from './ChessPieces/Rook';
import { Queen } from './ChessPieces/Queen';
import { King } from './ChessPieces/King';
import { ChessEffects } from './ChessMisc/ChessEffects';
import { ChessCastling } from './ChessMechanics/ChessCastling';
import { ChessDataHandler } from './ChessData/ChessDataHandler';
import { ChessExternalControl } from './ChessMisc/ChessExternalControl';
import { PawnTransformation } from './ChessMechanics/PawnTransformation';
import store, { getSquares } from '../../../store';
import { DatabaseHandler } from '../../shared/DatabaseHandler';
import { SocketHandling } from './ChessMisc/SocketHandling';

interface IFiguresClasses {
  [key: string]: King | Queen | Rook | Bishop | Knight | Pawn;
  king: King;
  queen: Queen;
  rook: Rook;
  bishop: Bishop;
  knight: Knight;
  pawn: Pawn;
}

export class ChessLogic {
  private readonly render: Render;

  private readonly db: DatabaseHandler;

  public readonly ui: ChessExternalControl;

  public readonly data: ChessDataHandler;

  public readonly effects: ChessEffects;

  public readonly evolve: PawnTransformation;

  public readonly castling: ChessCastling;

  public readonly figures: IFiguresClasses;

  private readonly socket: SocketHandling;

  constructor(render: Render, data: ChessDataHandler) {
    this.render = render;

    this.data = data;

    this.db = new DatabaseHandler();

    this.ui = new ChessExternalControl(render, data);

    this.effects = new ChessEffects(render, data);

    this.castling = new ChessCastling(data);

    this.evolve = new PawnTransformation(render, data);

    this.socket = new SocketHandling(data);

    this.figures = {
      king: new King(data),
      queen: new Queen(data),
      rook: new Rook(data),
      bishop: new Bishop(data),
      knight: new Knight(data),
      pawn: new Pawn(data),
    };
  }

  public newTurnActions(isSimulation = false): void {
    if (this.data.isNewTurn) {
      this.data.isNewTurn = false;

      if (!this.data.isAIEvaluateEnemyMode) {
        this.effects.resetCheckHighlight();
        this.data.resetCheckMateSquares();
      }

      if (isSimulation) {
        this.data.getAllOccupiedSquares(this.render.game.piecesPrediction, this.data.potentiallyOccupiedSquares);
      } else {
        this.data.getAllOccupiedSquares(this.render.game.piecesPosition, this.data.occupiedSquares);
      }
    }
  }

  public ismoveLegit(finalSquare: string): boolean {
    return (
      this.data.piece.actions.uiMoves.includes(finalSquare) ||
      (this.data.piece.actions.moves.includes(finalSquare) && this.data.piece.pieceName !== `king`) ||
      this.data.piece.actions.attacks.includes(finalSquare)
    );
  }

  public async movePieces(squares: string): Promise<void> {
    const [square1, square2] = getSquares(squares);

    if (this.isMoveCanHappen(square1, square2)) {
      store.isAnimationInProgress = true;

      this.data.timer.pauseTimer();

      await this.ui.movePiece(squares);

      await this.updateGameData(square2);

      this.data.timer.runTimer();

      store.isAnimationInProgress = false;
    }
  }

  private isMoveCanHappen(square1: string, square2: string): boolean {
    if (this.render.game.squares[square1] && this.render.game.squares[square2]) {
      this.data.isDataCollectingMode = true;

      this.findPiece(square1);

      this.data.isDataCollectingMode = false;

      const isPieceTurn = this.data.piece.isWhite === this.render.game.isActiveWhite;

      const isMoveLegit = this.ismoveLegit(square2);

      if (isMoveLegit && isPieceTurn) {
        return true;
      }
      this.rotateBoardOnFailedAdvanceMove();

      return false;
    }
    return false;
  }

  private rotateBoardOnFailedAdvanceMove(): void {
    if (this.render.lobby.IsLocalGame()) {
      this.data.isBoardShouldRotate = true;
    }
  }

  public findPiece(initSquare: string, isSimulation = false): void {
    this.data.storePieceParams(initSquare, isSimulation);

    this.newTurnActions(isSimulation);

    if (!isSimulation) {
      this.effects.resetHighlight();
    }

    if (!this.data.isGameFinished) {
      this.setPieceBehavior();
    }
  }

  private setPieceBehavior(): void {
    this.getPotentialActions();

    this.removeDangerousMoves();

    this.kingCheckCheck();

    this.handlePieceActions();
  }

  private getPotentialActions(): void {
    if (this.data.piece.pieceName) {
      this.data.piece.actions = this.figures[this.data.piece.pieceName].getActions(
        this.data.piece.square,
        this.data.piece.isWhite,
      );
    }
  }

  private removeDangerousMoves(): void {
    this.removePiecesMovesDangerousForItself();

    this.removePiecesMovesDangerousForKing();
  }

  private removePiecesMovesDangerousForItself(): void {
    this.suicidalMovesCheck();

    this.removeDangerousMovesForPiece();
  }

  private removePiecesMovesDangerousForKing(): void {
    this.removeMovesWhichWillKillKing();

    this.storeMoveWhatKillKingWhenIterating();
  }

  private handlePieceActions(): void {
    if (this.data.isGameMode()) {
      if (!this.data.isEndgameCheckInProgress && !this.data.isAICompletedTurn) {
        this.setTurnActions();
      } else if (this.isPieceHasAnyMoves()) {
        this.data.isNoLegalTurns = false;
      }
    }
  }

  private setTurnActions(): void {
    if (this.data.isAITurn() && this.data.piece.isWhite !== this.render.game.isFirstPlayerWhite) {
      this.createAiTurnActions();
    } else if (this.data.isAIEvaluateEnemyMode) {
      this.aiEnemyPrediction();
    } else if (!this.data.isDataCollectingMode) {
      this.effects.showMoves(this.data.piece);
    }
  }

  private createAiTurnActions(): void {
    this.storeAiBoardState();

    this.data.aiPiece.actions.attacks.forEach(move => {
      this.createPotentialMove(move);

      this.movePieceFromUnderAttack();

      this.simulateAiTurn(move);
    });

    if (this.data.aiPiece.pieceName !== 'king') {
      this.data.aiPiece.actions.moves.forEach(move => {
        this.createPotentialMove(move);

        this.removeRepeatedTurns(move);

        this.movePieceFromUnderAttack();

        this.aiMoveEncouragements(move);

        this.simulateAiTurn(move);
      });
    }

    this.data.aiPiece.actions.uiMoves.forEach(move => {
      this.createPotentialMove(move);

      this.discourageAiDangerousMoves();

      this.simulateAiTurn(move);
    });

    this.restoreAiBoardState();
  }

  private discourageAiDangerousMoves(): void {
    if (this.data.aiPiece.pieceName !== 'king') {
      this.data.potentialMove.value -= this.data.piecesValue[this.data.aiPiece.pieceName].lose;
    } else if (this.data.turnNumber < 25) {
      this.data.potentialMove.value -= 25;
    }
  }

  private storeAiBoardState(): void {
    this.data.aiPiece = JSON.parse(JSON.stringify(this.data.piece));
    this.render.game.aiPiecePrediction = JSON.parse(JSON.stringify(this.render.game.piecesPosition));

    this.data.isAIEvaluationMode = true;
  }

  private restoreAiBoardState(): void {
    this.data.isAIEvaluationMode = false;

    this.data.piece = JSON.parse(JSON.stringify(this.data.aiPiece));

    this.data.storedPiece = JSON.parse(JSON.stringify(this.data.aiPiece));

    this.render.game.piecesPosition = JSON.parse(JSON.stringify(this.render.game.aiPiecePrediction));

    this.data.resetTurnData();

    this.data.isNoLegalTurns = false;

    this.data.getAllOccupiedSquares(this.render.game.piecesPosition, this.data.occupiedSquares);
  }

  private removeRepeatedTurns(move: string): void {
    const uiMovePos = this.data.aiPiece.actions.uiMoves.indexOf(move);

    if (uiMovePos !== -1) {
      this.data.aiPiece.actions.uiMoves.splice(uiMovePos, 1);
    }
  }

  private aiMoveEncouragements(move: string): void {
    if (this.data.aiPiece.pieceName === 'rook' && this.data.turnNumber < 10) {
      this.data.potentialMove.value -= 10;
    }

    if (this.data.aiPiece.pieceName === 'knight' && move.split('')[0] !== `E`) {
      this.data.potentialMove.value += 5;
    }
    if (this.data.aiPiece.pieceName === 'pawn' || this.data.aiPiece.pieceName === 'bishop') {
      this.data.potentialMove.value += 3;
    }

    if (this.data.aiPiece.square === this.data.pieceUsedLastTurn) {
      this.data.potentialMove.value -= 10;
    }

    if (
      (!this.data.aiPiece.isUnderAttack &&
        this.data.aiPiece.isWhite &&
        +this.data.aiPiece.square.split('')[1] > +move.split('')[1]) ||
      (!this.data.aiPiece.isWhite && +this.data.aiPiece.square.split('')[1] < +move.split('')[1])
    ) {
      this.data.potentialMove.value -= 5;
    }
  }

  private simulateAiTurn(move: string): void {
    this.render.game.piecesPosition = JSON.parse(JSON.stringify(this.render.game.aiPiecePrediction));

    this.data.piece = JSON.parse(JSON.stringify(this.data.aiPiece));

    this.data.resetTurnData();

    this.data.isNoLegalTurns = false;

    this.createNewBoardState(move, false);

    this.data.getAllOccupiedSquares(this.render.game.piecesPosition, this.data.occupiedSquares);

    this.enemyResponceCalculation();

    this.bestMoveCalculation();
  }

  private enemyResponceCalculation(): void {
    if (this.render.lobby.selectSet.botSkill.value === `advance`) {
      this.data.isAIEvaluationMode = false;

      this.data.isAIEvaluateEnemyMode = true;

      this.data.bestEnemyMove.value = this.data.worstPossibleTurn;

      this.goThroughEnemyTeam(this.data.occupiedSquares, this.render.game.isActiveWhite);

      this.data.isAIEvaluationMode = true;

      this.data.isAIEvaluateEnemyMode = false;
    } else {
      this.data.bestEnemyMove.value = 0;
    }
  }

  private bestEnemyMoveCalc(): void {
    if (this.data.bestEnemyMove.value < this.data.potentialEnemyMove.value) {
      this.data.bestEnemyMove.squares = this.data.potentialEnemyMove.squares;

      this.data.bestEnemyMove.value = this.data.potentialEnemyMove.value;
    }
  }

  private aiEnemyPrediction(): void {
    this.data.storedPiece = JSON.parse(JSON.stringify(this.data.piece));

    this.data.storedPiece.actions.attacks.forEach(move => {
      this.createPotentailAiEnemyTurn(move);

      this.aiEnemyIterations(move);
    });

    // ---------------------------------------------------------------------------------------
    if (this.data.storedPiece.pieceName !== 'king') {
      this.data.storedPiece.actions.moves.forEach(move => {
        this.createPotentailAiEnemyTurn(move);

        this.removeRepeatedMovesEnemy(move);

        this.aiEnemyIterations(move);
      });
    }

    this.data.storedPiece.actions.uiMoves.forEach(move => {
      this.createPotentailAiEnemyTurn(move);

      this.aiEnemyIterations(move);
    });

    this.data.piece = JSON.parse(JSON.stringify(this.data.storedPiece));
  }

  private removeRepeatedMovesEnemy(move: string): void {
    const uiMovePos = this.data.storedPiece.actions.uiMoves.indexOf(move);

    if (uiMovePos !== -1) {
      this.data.storedPiece.actions.uiMoves.splice(uiMovePos, 1);
    }
  }

  private createPotentailAiEnemyTurn(move: string): void {
    this.data.potentialEnemyMove.value = 0;
    this.data.potentialEnemyMove.squares = `${this.data.storedPiece.square}${move}`;
  }

  private aiEnemyIterations(move: string): void {
    this.render.game.piecesPrediction = JSON.parse(JSON.stringify(this.render.game.piecesPosition));

    this.createNewBoardState(move, true);

    this.bestEnemyMoveCalc();
  }

  private bestMoveCalculation(): void {
    const finalValue = this.data.potentialMove.value - this.data.bestEnemyMove.value;

    if (this.data.bestMove.value < finalValue || (this.data.bestMove.value === finalValue && Math.random() > 0.5)) {
      this.data.bestMove.squares = this.data.potentialMove.squares;

      this.data.bestMove.value = this.data.potentialMove.value - this.data.bestEnemyMove.value;
    }
  }

  private movePieceFromUnderAttack(): void {
    if (
      this.data.aiPiece.isUnderAttack &&
      this.data.aiPiece.pieceName !== 'king' &&
      this.render.lobby.selectSet.botSkill.value !== `advance`
    ) {
      this.data.potentialMove.value += this.data.piecesValue[this.data.aiPiece.pieceName].lose;
    }
  }

  private createPotentialMove(move: string): void {
    this.data.potentialMove.squares = `${this.data.aiPiece.square}${move}`;

    this.data.potentialMove.value = 0;
  }

  private isPieceHasAnyMoves(): boolean {
    return !!(this.data.piece.actions.uiMoves.length || this.data.piece.actions.attacks.length);
  }

  private removeMovesWhichWillKillKing(): void {
    if (this.data.isGameMode()) {
      this.data.mode = this.data.modes.suicideKingPrevention;

      this.data.kingPosition = this.data.getKingLocation(this.data.piece.isWhite);

      this.checkIsMoveGrantCheckmate(this.data.storedPiece.actions.uiMoves);

      this.checkIsMoveGrantCheckmate(this.data.storedPiece.actions.attacks);

      this.data.restorePieceData();

      this.data.removeMovesWhatWillKillKing();
    }
  }

  private storeMoveWhatKillKingWhenIterating(): void {
    if (this.data.mode === this.data.modes.suicideKingPrevention) {
      this.data.piece.actions.attacks.forEach(attackCoord => {
        if (attackCoord === this.data.kingPosition) {
          this.data.isMoveWillKillKing = true;
        }
      });
    }
  }

  private removeDangerousMovesForPiece(): void {
    if (this.data.mode === this.data.modes.suicidePrevention && !this.data.isEndgameCheckInProgress) {
      if (this.data.storedPiece.pieceName === 'king') {
        this.removeSuicidalMoves(this.data.storedPiece.actions.uiMoves);
      } else {
        this.removeSuicidalMoves(this.data.storedPiece.actions.moves);
      }
    }
  }

  private suicidalMovesCheck(): void {
    if (this.data.isGameMode()) {
      this.iterateThroughEnemyTeam();

      this.addCastlingMoves();
    }
  }

  private iterateThroughEnemyTeam(isSimulation = false): void {
    this.data.mode = this.data.modes.suicidePrevention;

    this.data.squareToIgnore = this.data.piece.square;

    this.checkEnemyAttacks(isSimulation);
  }

  private addCastlingMoves(): void {
    if (this.data.piece.pieceName === 'king' && !this.data.isEndgameCheckInProgress) {
      this.castling.checkIfCastlingAvailable(this.render.game.piecesPosition, this.data.piece.isWhite);

      this.iterateThroughEnemyTeam();
    }
  }

  private kingCheckCheck(): void {
    if (this.data.mode === this.data.modes.kingCheckCheck) {
      this.data.piece.actions.attacks.forEach(attackCoord => {
        if (attackCoord === this.data.storedPiece.square) {
          this.data.checkMateSquares.king = this.data.storedPiece.square;

          this.data.checkMateSquares.attacker = this.data.piece.square;

          this.effects.showKingsCheck();
        }
      });
    }
  }

  private checkEnemyAttacks(isSimulation = false): void {
    this.data.storePieceData();

    if (isSimulation) {
      this.goThroughEnemyTeam(this.data.potentiallyOccupiedSquares, this.data.piece.isWhite);
    } else {
      this.goThroughEnemyTeam(this.data.occupiedSquares, this.data.piece.isWhite);
    }

    this.data.restorePieceData();
  }

  private removeSuicidalMoves(moves: string[]): void {
    this.data.piece.actions.potentialAttacks.forEach(attackCoord => {
      if (attackCoord === this.data.storedPiece.square) {
        this.data.storedPiece.isUnderAttack = true;
      }

      const numOfAttackedSquare = moves.indexOf(attackCoord);

      if (numOfAttackedSquare !== -1) {
        moves.splice(numOfAttackedSquare, 1);
      }
    });
  }

  private checkIsMoveGrantCheckmate(moveSource: string[]): void {
    moveSource.forEach(move => {
      this.data.isMoveWillKillKing = false;

      if (this.data.storedPiece.pieceName === 'king') {
        this.data.kingPosition = move;
      }

      this.createNewBoardState(move, true);

      this.data.getAllOccupiedSquares(this.render.game.piecesPrediction, this.data.potentiallyOccupiedSquares);

      this.goThroughEnemyTeam(this.data.potentiallyOccupiedSquares, this.data.storedPiece.isWhite);

      this.data.storeMovesWhatWillKillKing(move, moveSource);
    });
  }

  private checkIsKingUnderAttack(): void {
    this.data.mode = this.data.modes.kingCheckCheck;

    const enemyKingSquare = this.data.getKingLocation(!this.data.piece.isWhite);

    this.data.isDataCollectingMode = true;

    this.findPiece(enemyKingSquare);

    this.data.isDataCollectingMode = false;

    this.checkEnemyAttacks();
  }

  private async checkIsItCastling(newSquare: string): Promise<void> {
    const move = this.castling.getCastlingMove(newSquare);

    if (move) {
      await this.ui.movePiece(move);
    }

    this.data.castling.isMovesAdded = false;

    this.data.castlingSquare = '';
  }

  private createNewBoardState(newSquare: string, isSimulation: boolean): void {
    const updateData: IUpdatePieceData = {
      piece: isSimulation ? this.data.storedPiece : this.data.piece,
      set: isSimulation ? this.render.game.piecesPrediction : this.render.game.piecesPosition,
      to: newSquare,
    };

    this.data.updateTeamHexes(updateData);
  }

  public async updateGameData(newSquare: string, isSimulation = false): Promise<void> {
    this.effects.resetHighlight();

    this.data.resetTurnData();

    this.data.isEndgameCheckInProgress = true;

    await this.checkIsItCastling(newSquare);

    if (this.data.piece.pieceName === 'pawn') {
      this.evolve.checkIsPawnShouldTransform(newSquare, isSimulation);
    }

    if (!isSimulation && !this.data.isAIEvaluationMode) {
      await this.createLog(newSquare);
    }

    this.createNewBoardState(newSquare, isSimulation);

    this.data.piece.isUnderAttack = false;

    this.data.storedPiece.isUnderAttack = false;

    this.checkIsKingUnderAttack();

    this.render.game.isActiveWhite = !this.render.game.isActiveWhite;

    this.render.game.highlightActivePlayer();

    this.checkEndGame();

    if (!isSimulation && !this.data.isAIEvaluationMode && !this.data.isAICompletedTurn) {
      await this.findBestAITurn();
    }

    if (!this.render.game.isReplayMode) {
      await this.makeAdvanceTurn();
    }
  }

  public async findBestAITurn(): Promise<void> {
    return new Promise(resolve => {
      const timeForUserAdvanceTurn = 2000;

      if (this.data.isAITurn()) {
        if (this.isAdvanceBaseMoveOk()) {
          setTimeout(() => {
            this.selectAdvanceBaseMove().then(() => {
              resolve();
            });
          }, timeForUserAdvanceTurn);
        } else {
          setTimeout(() => {
            this.data.bestMove.squares = '';

            this.data.bestMove.value = this.data.worstPossibleTurn;

            this.goThroughEnemyTeam(this.data.occupiedSquares, !this.render.game.isActiveWhite);

            this.data.isAICompletedTurn = true;

            this.movePieces(this.data.bestMove.squares).then(() => {
              this.data.isAICompletedTurn = false;

              [, this.data.pieceUsedLastTurn] = this.data.bestMove.squares.split(' ');

              resolve();
            });
          }, timeForUserAdvanceTurn);
        }
      } else {
        resolve();
      }
    });
  }

  private isAdvanceBaseMoveOk(): boolean {
    if (this.data.okBases.length) {
      const turn = this.data.okBases[0].moves.split(' ')[this.data.turnNumber];
      if (turn) {
        const [square1, square2] = getSquares(turn);

        return this.isMoveCanHappen(square1, square2);
      }
      return false;
    }
    return false;
  }

  private async selectAdvanceBaseMove(): Promise<void> {
    const turn = this.data.okBases[0].moves.split(' ')[this.data.turnNumber];

    this.data.isAICompletedTurn = true;

    await this.movePieces(turn);

    this.data.isAICompletedTurn = false;
  }

  private async createLog(newSquare: string): Promise<void> {
    const log = `${this.data.storedPiece.pieceName}: ${this.data.storedPiece.square}-${newSquare}`;

    this.render.game.addLog(`${log} (${store.timerElem.innerText})`, this.render.game.isActiveWhite);

    this.data.turnNumber++;

    this.data.gameData.turns.push(`${this.data.storedPiece.square}${newSquare}`);

    this.data.gameData.time.push(store.timerElem.innerText);

    if (this.render.lobby.IsServerGameMode()) {
      const turn: IMessage = {
        content: `${this.data.storedPiece.square}${newSquare}`,
        type: 'gameTurn',
      };

      if (this.data.socket?.readyState === 1) {
        this.data.socket?.send(JSON.stringify(turn));
      }
    }

    if (this.data.okBases.length && this.render.lobby.IsAIGameMode()) {
      this.data.parseBase(this.data.okBases);
    }
  }

  public async handleSocket(): Promise<void> {
    if (this.render.lobby.IsServerGameMode()) {
      await this.socket.closeSocket();

      await this.socket.openSocket();

      await this.handleServerMessages();
    }
  }

  private handleServerMessages(): Promise<void> {
    return new Promise(resolve => {
      (this.data.socket as WebSocket).onmessage = event => {
        const msg: IMessage = JSON.parse(event.data);

        if (msg.type === `gameTurn`) {
          this.movePieces(msg.content).then(() => {
            resolve();
          });
        }

        if (msg.type === `gameEnd`) {
          if (this.render.isPlayerWhiteServer) {
            this.gameFinishedByYield(`white`);
          } else {
            this.gameFinishedByYield(`black`);
          }

          resolve();
        }

        if (msg.type === `offerDraw`) {
          this.offerDraw();
          resolve();
        }

        if (msg.type === `drawDeclined`) {
          this.drawDeclined(true);
          resolve();
        }

        if (msg.type === `drawAccepted`) {
          this.gameFinishedByAgreement(true);
          resolve();
        }

        if (msg.type === `oppDisconnect` && !this.data.isGameFinished) {
          this.gameFinishedByDisconnect();
          resolve();
        }
      };
    });
  }

  private async makeAdvanceTurn(): Promise<void> {
    if (this.data.isAdvanceTurnMade) {
      this.data.isAdvanceTurnMade = false;

      this.data.isBoardShouldRotate = false;

      this.effects.removeAdvanceMove(getSquares(this.data.storedSquareForAdvanceTurn)[1]);

      this.data.isAICompletedTurn = false;

      await this.movePieces(this.data.storedSquareForAdvanceTurn);
    }
  }

  private checkEndGame(): void {
    this.data.storePieceData();

    this.goThroughEnemyTeam(this.data.occupiedSquares, !this.data.piece.isWhite);

    this.data.restorePieceData();

    this.checkEndGameState();
  }

  private checkEndGameState(): void {
    if (this.data.isNoLegalTurns && this.data.checkMateSquares.king && !this.data.isGameFinished) {
      this.gameFinishedByCheckMate();
    } else if (this.data.isNoLegalTurns && !this.data.isGameFinished) {
      this.gameFinishedByStalemate();
    }

    this.data.isEndgameCheckInProgress = false;
  }

  private goThroughTeamPieces(teamSquares: string[], isSimulation = false): void {
    teamSquares.forEach(square => {
      this.findPiece(square, isSimulation);
    });
  }

  private goThroughEnemyTeam(squaresSet: ISquaresSet, isWhite: boolean, isSimulation = false): void {
    if (isWhite) {
      this.goThroughTeamPieces(squaresSet.black, isSimulation);
    } else {
      this.goThroughTeamPieces(squaresSet.white, isSimulation);
    }
  }

  private async sendReplayDataToDb(winner: string): Promise<void> {
    const replayData: IReplayData = {
      winner,
      whitePlayer: this.render.game.isFirstPlayerWhite ? store.playerOneName : store.playerTwoName,
      blackPlayer: this.render.game.isFirstPlayerWhite ? store.playerTwoName : store.playerOneName,
      whiteAvatar: this.render.game.isFirstPlayerWhite ? this.render.game.playerAvatar : this.render.game.oppAvatar,
      blackAvatar: this.render.game.isFirstPlayerWhite ? this.render.game.oppAvatar : this.render.game.playerAvatar,
      gameTime: store.timerElem.innerText,
      turnsTime: this.data.gameData.time,
      turns: this.data.gameData.turns,
      whiteHandicap: this.render.game.handicapSquares.white,
      blackHandicap: this.render.game.handicapSquares.black,
    };

    await this.db.addReplay(replayData);
  }

  private async gameFinishedByCheckMate(): Promise<void> {
    this.setEndgameState();

    this.effects.handleCheckmate();

    const winner = this.data.getWinner();

    const uiDelay = 1500;

    const results: IText = {
      winner,
      time: store.timerElem.innerText,
      winBy: 'Game finished by checkmate!',
    };

    setTimeout(() => {
      this.render.genererateEndGamepopup(results);
    }, uiDelay);

    if (!this.render.game.isReplayMode) {
      await this.sendReplayDataToDb(this.data.matchWinner);
    }
  }

  private async gameFinishedByStalemate(): Promise<void> {
    this.setEndgameState();

    const uiDelay = 1500;

    this.data.isDataCollectingMode = true;

    this.findPiece(this.data.getKingLocation(this.data.piece.isWhite));

    this.data.isDataCollectingMode = false;

    this.effects.handleStalemate();

    const results: IText = {
      winner: `It's a draw.`,
      time: store.timerElem.innerText,
      winBy: 'Game finished by stalemate.',
    };

    setTimeout(() => {
      this.render.genererateEndGamepopup(results);
    }, uiDelay);
    if (!this.render.game.isReplayMode) {
      await this.sendReplayDataToDb(``);
    }
  }

  private async gameFinishedByDisconnect(): Promise<void> {
    this.setEndgameState();

    const results: IText = {
      winner: `${store.playerOneName} has won!`,
      time: store.timerElem.innerText,
      winBy: 'Game finished by disconnect',
    };

    this.render.genererateEndGamepopup(results);

    if (this.render.game.isFirstPlayerWhite) {
      this.data.matchWinner = `white`;
    } else {
      this.data.matchWinner = `black`;
    }

    if (!this.render.game.isReplayMode) {
      await this.sendReplayDataToDb(this.data.matchWinner);
    }
  }

  setWinnerColorOnFirstPlayerLose(): void {
    if (this.render.game.isFirstPlayerWhite) {
      this.data.matchWinner = `black`;
    } else {
      this.data.matchWinner = `white`;
    }
  }

  getWinnerText(winner?: string): string {
    let winnerText = ``;

    if (!winner) {
      switch (true) {
        case this.render.lobby.IsAIGameMode():
          this.setWinnerColorOnFirstPlayerLose();
          winnerText = `AI has bested ${store.playerOneName}. Good luck next time!`;

          break;
        case this.render.lobby.IsLocalGame():
          winnerText = this.data.getWinner();

          break;
        case this.render.lobby.IsServerGameMode():
          this.setWinnerColorOnFirstPlayerLose();
          winnerText = `${store.playerTwoName} has won!`;

          break;
        default:
      }
    } else {
      winnerText = `${store.playerOneName} has won!`;

      this.data.matchWinner = winner;
    }

    return winnerText;
  }

  public async gameFinishedByYield(winner?: string): Promise<void> {
    this.setEndgameState();

    const results: IText = {
      winner: this.getWinnerText(winner),
      time: store.timerElem.innerText,
      winBy: 'Game finished by surrender',
    };

    this.sendYieldMessage();

    this.render.genererateEndGamepopup(results);

    if (!this.render.game.isReplayMode) {
      await this.sendReplayDataToDb(this.data.matchWinner);
    }
  }

  private sendYieldMessage(): void {
    if (this.render.lobby.IsServerGameMode() && this.data.isPlayerYielded) {
      this.data.isPlayerYielded = false;

      const msg: IMessage = {
        content: `yield`,
        type: 'gameEnd',
      };

      if (this.data.socket && this.data.socket.readyState === 1) {
        this.data.socket?.send(JSON.stringify(msg));
      }
    }
  }

  public setEndgameState(): void {
    this.data.isGameFinished = true;

    store.isTimerCanRestart = false;

    this.data.timer.resetTime();
  }

  public async gameFinishedByAgreement(isOfferSended = false): Promise<void> {
    this.setEndgameState();

    if (this.render.lobby.IsServerGameMode() && !isOfferSended) {
      const msg: IMessage = {
        content: ``,
        type: 'drawAccepted',
      };

      this.data.socket?.send(JSON.stringify(msg));
    }

    const results: IText = {
      winner: `It's a draw.`,
      time: store.timerElem.innerText,
      winBy: 'Game finished by agreement',
    };

    this.render.genererateEndGamepopup(results);

    if (!this.render.game.isReplayMode) {
      await this.sendReplayDataToDb(``);
    }
  }

  private generateDrawOffer(): IText {
    const offer: IText = {};

    if (
      this.render.game.isActiveWhite === this.render.game.isFirstPlayerWhite &&
      !this.render.lobby.IsServerGameMode()
    ) {
      offer.from = store.playerOneName;
      offer.to = store.playerTwoName;
    } else {
      offer.from = store.playerTwoName;
      offer.to = store.playerOneName;
    }

    return offer;
  }

  public offerDraw(isOfferSent = false): void {
    if (this.render.lobby.selectSet.gameMode.value !== 'ai') {
      const offer: IText = this.generateDrawOffer();

      this.render.header.section.content.classList.add('modal-window-background');

      this.render.game.gameField.classList.add('inactive');

      if (isOfferSent) {
        const msg: IMessage = {
          content: ``,
          type: 'offerDraw',
        };

        this.data.socket?.send(JSON.stringify(msg));
      }

      this.render.popup.addDrawOfferPopup(offer, isOfferSent);

      this.setDrawOfferListeners();
    }
  }

  private setDrawOfferListeners(): void {
    this.render.popup.navButtons.lobby.onclick = () => this.drawDeclined();

    this.render.popup.navButtons.replay.onclick = () => this.gameFinishedByAgreement();
  }

  private drawDeclined(isServerAnswer = false): void {
    if (this.render.lobby.IsServerGameMode() && !isServerAnswer) {
      const msg: IMessage = {
        content: ``,
        type: 'drawDeclined',
      };

      this.data.socket?.send(JSON.stringify(msg));
    }

    this.render.header.section.content.classList.remove('modal-window-background');

    this.render.game.gameField.classList.remove('inactive');

    store.popup.remove();
  }
}
