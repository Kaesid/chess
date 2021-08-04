import {
  IGameData,
  IBase,
  IFlag,
  IPieceInfo,
  IPieceLoc,
  IPiecesSetLoc,
  IPiecesValues,
  ISquareParams,
  ISquaresSet,
  IText,
  ITurnsValue,
  IUpdatePieceData,
} from '../../../../intefaces';

import store from '../../../../store';
import { Render } from '../../../render/Render';

import rawBaseOne from '../../../../assets/bases/base1.json';
import rawBaseTwo from '../../../../assets/bases/base2.json';
import { Timer } from '../../../shared/Timer';

function removeMove(squares: string[], square: string): void {
  const index = squares.indexOf(square);

  if (index !== -1) {
    squares.splice(index, 1);
  }
}

function addOccupiedSquares(piecesLoc: IPieceLoc, squaresArr: string[]): void {
  Object.entries(piecesLoc).forEach(pieceArr => {
    pieceArr[1].forEach(square => {
      squaresArr.push(square);
    });
  });
}

export class ChessDataHandler {
  private readonly render: Render;

  public readonly timer: Timer;

  socket: WebSocket | undefined;

  activePieceHTML: HTMLImageElement = document.createElement('img');

  gameData: IGameData = {
    turns: [],
    time: [],
  };

  worstPossibleTurn = -15000;

  bestMove: ITurnsValue = {
    squares: '',
    value: this.worstPossibleTurn,
  };

  bestEnemyMove: ITurnsValue = {
    squares: '',
    value: this.worstPossibleTurn,
  };

  potentialEnemyMove: ITurnsValue = {
    squares: '',
    value: this.worstPossibleTurn,
  };

  potentialMove: ITurnsValue = {
    squares: '',
    value: this.worstPossibleTurn,
  };

  potentialCountermove: ITurnsValue = {
    squares: '',
    value: this.worstPossibleTurn,
  };

  checkMateSquares: IText = {
    king: '',
    attacker: '',
  };

  castling: IFlag = {
    isAvailableWhite: true,
    isAvailableBlack: true,
    isMovesAdded: false,
  };

  potentiallyOccupiedSquares: ISquaresSet = {
    white: [],
    black: [],
    all: [],
  };

  occupiedSquares: ISquaresSet = {
    white: [],
    black: [],
    all: [],
  };

  piece: IPieceInfo = {
    isWhite: true,

    isUnderAttack: false,

    square: '',

    pieceName: '',

    actions: {
      uiMoves: [],
      attacks: [],
      potentialAttacks: [],
      moves: [],
    },
  };

  piecesValue: IPiecesValues = {
    king: {
      lose: 10000,
      take: 11000,
    },
    queen: {
      lose: 105,
      take: 100,
    },
    rook: {
      lose: 55,
      take: 50,
    },
    bishop: {
      lose: 30,
      take: 25,
    },
    knight: {
      lose: 30,
      take: 25,
    },
    pawn: {
      lose: 12,
      take: 10,
    },
  };

  modes: IText = {
    game: 'game',
    suicidePrevention: `prevention of  suicidal piece's move`,
    suicideKingPrevention: `prevention of piece's moves which are suicidal for king`,
    kingCheckCheck: `checking, if its kings check `,
    legalMovesCheck: `checking, is there any legal moves yet `,
  };

  storedPiece: IPieceInfo = JSON.parse(JSON.stringify(this.piece));

  aiPiece: IPieceInfo = JSON.parse(JSON.stringify(this.piece));

  okBases: IBase[] = [];

  mode: string = this.modes.game;

  realtimes: number[] = [];

  movesToDelete: string[] = [];

  castlingSquare = ``;

  finalSquare = '';

  kingPosition = '';

  squareToIgnore = '';

  pieceUsedLastTurn = ``;

  storedSquareForAdvanceTurn = '';

  evolvePawnSquare = '';

  matchWinner = ``;

  turnNumber = 0;

  isDataCollectingMode = false;

  isGameFinished = false;

  isPlayerYielded = false;

  isMoveWillKillKing = true;

  isSafetyOfMovingChecking = false;

  isAICompletedTurn = false;

  isAICheckingMode = false;

  isAIEvaluationMode = false;

  isAIEvaluateEnemyMode = false;

  isNewTurn = true;

  isBoardShouldRotate = true;

  isAdvanceTurn = false;

  isAdvanceTurnMade = false;

  isPawnShouldEvolve = false;

  isNoLegalTurns = false;

  isEndgameCheckInProgress = false;

  isPiecesSelected = false;

  isAdvanceTurnPieceSelected = false;

  constructor(render: Render) {
    this.render = render;
    this.timer = new Timer();
  }

  public prepareBases(): void {
    if (this.render.lobby.IsAIGameMode()) {
      if (this.render.lobby.selectSet.botSkill.value === `advance`) {
        const baseOne = rawBaseOne as IBase[];

        const baseTwo = rawBaseTwo as IBase[];

        const fullBase = baseOne.concat(baseTwo);

        this.parseBase(fullBase as IBase[]);
      } else {
        this.parseBase(rawBaseOne as IBase[]);
      }
    }
  }

  public parseBase(base: IBase[]): void {
    if (this.render.lobby.IsAIGameMode()) {
      let moves: string[] = [];

      const localCopy: IBase[] = JSON.parse(JSON.stringify(base));

      this.okBases = [];

      localCopy.forEach(match => {
        moves = match.moves.split(' ');

        let isBaseOk = true;

        this.gameData.turns.forEach((move, i) => {
          if (moves[i] !== move.toLowerCase()) {
            isBaseOk = false;
          }
        });
        if (isBaseOk) {
          this.okBases.push(match);
        }
      });

      this.okBases.sort(() => Math.random() - 0.5);
    }
  }

  public isGameMode(): boolean {
    return this.mode === this.modes.game;
  }

  public isSuicidePreventionMode(): boolean {
    return this.mode === this.modes.suicidePrevention;
  }

  public isKingCheckMode(): boolean {
    return this.mode === this.modes.kingCheckCheck;
  }

  public isSuicideKingPreventionMode(): boolean {
    return this.mode === this.modes.suicideKingPrevention;
  }

  public isAITurn(): boolean {
    return !!(
      this.render.lobby.IsAIGameMode() && this.render.game.isFirstPlayerWhite !== this.render.game.isActiveWhite
    );
  }

  public resetTurnData(): void {
    this.isNewTurn = true;

    this.isPiecesSelected = false;

    this.isNoLegalTurns = true;

    this.storedPiece.isUnderAttack = false;

    this.occupiedSquares.white = [];

    this.occupiedSquares.black = [];

    this.potentiallyOccupiedSquares.white = [];

    this.potentiallyOccupiedSquares.black = [];
  }

  public resetGameData(): void {
    if (this.render.lobby.selectSet.gameMode.value === 'ai' && !this.render.game.isReplayMode) {
      this.render.header.section.drawOfferButton.classList.add(`inactive`);
    }

    if (this.socket) {
      this.socket.onmessage = null;
      this.socket.onopen = null;
    }

    if (!this.render.game.isReplayMode) {
      store.replayTimeSpeed = 1;
    }

    store.isTimerCanRestart = true;

    store.isAnimationInProgress = false;

    this.isGameFinished = false;

    this.isBoardShouldRotate = true;

    this.isPlayerYielded = false;

    this.isAdvanceTurnMade = false;

    this.castling.isAvailableWhite = true;

    this.castling.isAvailableBlack = true;

    this.turnNumber = 0;

    this.isAIEvaluateEnemyMode = false;

    this.isAIEvaluateEnemyMode = false;

    this.gameData.turns = [];

    this.gameData.time = [];

    this.matchWinner = ``;

    this.realtimes = [];
  }

  public resetCheckMateSquares(): void {
    this.checkMateSquares.king = '';

    this.checkMateSquares.attacker = '';
  }

  public getSquareData(inputSquare: string): ISquareParams | null {
    const square = inputSquare.toUpperCase();
    const squareHTML = this.render.game.squares[square];

    if (!squareHTML) return null;

    const piece = squareHTML.firstElementChild as HTMLImageElement;

    if (!piece) return null;

    const piceColor = piece.alt.split(' ')[0];
    const pieceName = piece.alt.split(' ')[1];

    const data = {
      squareHTML,
      arrIndex: this.render.game.piecesPosition[piceColor][pieceName].indexOf(square),

      piece: {
        HTML: piece,
        color: piceColor,
        figure: pieceName,
      },
    };

    return data;
  }

  public storePieceParams(initSquare: string, isSimulation = false): void {
    const whiteSet = isSimulation ? this.render.game.piecesPrediction.white : this.render.game.piecesPosition.white;

    const blackSet = isSimulation ? this.render.game.piecesPrediction.black : this.render.game.piecesPosition.black;

    const isPieceExist = this.storePieceName(whiteSet, initSquare);

    this.piece.isUnderAttack = false;

    if (isPieceExist) {
      this.piece.isWhite = true;
    } else {
      this.storePieceName(blackSet, initSquare);
      this.piece.isWhite = false;
    }

    this.piece.square = initSquare;
  }

  private storePieceName(piecesLoc: IPieceLoc, initSquare: string): boolean {
    let flag = false;

    Object.entries(piecesLoc).forEach(pieceArr => {
      pieceArr[1].forEach(square => {
        if (square === initSquare) {
          flag = true;
          [this.piece.pieceName] = pieceArr;
        }
      });
    });

    return flag;
  }

  public getKingLocation(isWhite: boolean): string {
    if (isWhite) {
      return this.render.game.piecesPosition.white.king[0];
    }
    return this.render.game.piecesPosition.black.king[0];
  }

  public storePieceData(): void {
    this.storedPiece = JSON.parse(JSON.stringify(this.piece));

    this.squareToIgnore = this.piece.square;
  }

  public restorePieceData(): void {
    this.mode = this.modes.game;

    this.piece = JSON.parse(JSON.stringify(this.storedPiece));

    this.squareToIgnore = '';
  }

  public storeMovesWhatWillKillKing(move: string, moveSource: string[]): void {
    if (this.isMoveWillKillKing) {
      const index = moveSource.indexOf(move);

      this.movesToDelete.push(moveSource[index]);
    }
  }

  public removeMovesWhatWillKillKing(): void {
    this.movesToDelete.forEach(square => {
      removeMove(this.piece.actions.moves, square);

      removeMove(this.piece.actions.uiMoves, square);

      removeMove(this.piece.actions.attacks, square);
    });

    this.movesToDelete = [];
  }

  public updateTeamHexes({ piece, set, to }: IUpdatePieceData): void {
    let pieceTeam: IPieceLoc;

    let enemyTeam: IPieceLoc;

    if (piece.isWhite) {
      pieceTeam = set.white;

      enemyTeam = set.black;
    } else {
      pieceTeam = set.black;

      enemyTeam = set.white;
    }

    this.addMoveData(pieceTeam, piece, to);

    this.removeEnemyData(enemyTeam, to);

    this.updateEvolvePawnData(pieceTeam);
  }

  private addMoveData(pieceTeam: IPieceLoc, piece: IPieceInfo, square: string): void {
    const hexIndex = pieceTeam[`${piece.pieceName}`].indexOf(piece.square);

    if (hexIndex !== -1) {
      pieceTeam[`${piece.pieceName}`][hexIndex] = square;

      // ---------------------------------------------------------------------------

      if (this.isAIEvaluationMode) {
        this.setCastlingAdvantage();
        this.setPositionAdvantage(square, this.potentialMove);
      }

      if (this.isAIEvaluateEnemyMode) {
        this.setPositionAdvantage(square, this.potentialEnemyMove);
      }
    }
  }

  private setCastlingAdvantage(): void {
    if (
      this.castling.isMovesAdded &&
      this.potentialMove.squares === `${this.aiPiece.square}${this.castlingSquare}` &&
      this.aiPiece.pieceName === 'king'
    ) {
      this.potentialMove.value += 45;
    }
  }

  private setPositionAdvantage(square: string, moveData: ITurnsValue): void {
    const [letter, number] = square.split('');

    if (+number === 5 && this.turnNumber < 20) {
      moveData.value += 3;
    }

    if (letter === 'E' && this.turnNumber < 20) {
      moveData.value += 3;
    }

    if ((letter === 'D' || letter === 'G') && this.turnNumber < 20) {
      moveData.value += 2;
    }

    if ((+number === 4 || +number === 6) && this.turnNumber < 20) {
      moveData.value += 2;
    }
  }

  private removeEnemyData(enemyTeam: IPieceLoc, square: string): void {
    const figure = Object.keys(enemyTeam).find(key => enemyTeam[key].includes(square));

    if (figure) {
      const enemyHexIndex = enemyTeam[`${figure}`].indexOf(square);

      if (enemyHexIndex !== -1) {
        enemyTeam[`${figure}`].splice(enemyHexIndex, 1);
        // ---------------------------------------------------------------------------
        if (this.isAIEvaluationMode) {
          this.potentialMove.value += this.piecesValue[`${figure}`].take;
        }

        if (this.isAIEvaluateEnemyMode) {
          this.potentialEnemyMove.value += this.piecesValue[`${figure}`].lose;
        }

        // ---------------------------------------------------------------------------
      }
    }
  }

  private updateEvolvePawnData(pieceTeam: IPieceLoc): void {
    if (this.isPawnShouldEvolve) {
      this.isPawnShouldEvolve = false;
      const hexIndex = pieceTeam.pawn.indexOf(this.evolvePawnSquare);

      if (hexIndex !== -1) {
        pieceTeam.pawn.splice(hexIndex, 1);

        if (this.isAIEvaluationMode) {
          this.potentialMove.value += 100;
        }
        if (this.isAIEvaluateEnemyMode) {
          this.potentialEnemyMove.value += 100;
        }
      }

      pieceTeam.queen.push(this.evolvePawnSquare);
    }
  }

  public getAllOccupiedSquares(piecesSet: IPiecesSetLoc, squaresSet: ISquaresSet): void {
    this.resetPiecesPredictionStore();

    addOccupiedSquares(piecesSet.white, squaresSet.white);

    addOccupiedSquares(piecesSet.black, squaresSet.black);

    squaresSet.all = squaresSet.white.concat(squaresSet.black);
  }

  public resetPiecesPredictionStore(): void {
    this.potentiallyOccupiedSquares.white = [];

    this.potentiallyOccupiedSquares.black = [];

    this.render.game.piecesPrediction = JSON.parse(JSON.stringify(this.render.game.piecesPosition));
  }

  public getWinner(): string {
    let winner = '';

    if (this.render.game.isActiveWhite === this.render.game.isFirstPlayerWhite) {
      winner = `${store.playerTwoName} has won!`;
      this.matchWinner = store.playerTwoName;
      if (this.render.game.isFirstPlayerWhite) {
        this.matchWinner = `black`;
      } else {
        this.matchWinner = `white`;
      }
    } else {
      winner = `${store.playerOneName} has won!`;
      // this.matchWinner = store.playerOneName;
      if (this.render.game.isFirstPlayerWhite) {
        this.matchWinner = `white`;
      } else {
        this.matchWinner = `black`;
      }
    }

    return winner;
  }
}
