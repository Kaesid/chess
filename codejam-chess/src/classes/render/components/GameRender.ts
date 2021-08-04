import { InjectorDOM } from '../../shared/InjectorDOM';
import {
  IDOM,
  IDOMSet,
  IHTML,
  IPieceLoc,
  IPiecesDOMSset,
  IPiecesSetLoc,
  IReplayData,
  ISquareData,
  ISquaresData,
  IText,
} from '../../../intefaces';

import store from '../../../store';

import whitePawn from '../../../assets/images/pieces/white-pawn.png';
import blackPawn from '../../../assets/images/pieces/black-pawn.png';
import whiteBishop from '../../../assets/images/pieces/white-bishop.png';
import blackBishop from '../../../assets/images/pieces/black-bishop.png';
import whiteKnight from '../../../assets/images/pieces/white-knight.png';
import blackKnight from '../../../assets/images/pieces/black-knight.png';
import whiteRook from '../../../assets/images/pieces/white-rook.png';
import blackRook from '../../../assets/images/pieces/black-rook.png';
import whiteQueen from '../../../assets/images/pieces/white-queen.png';
import blackQueen from '../../../assets/images/pieces/black-queen.png';
import whiteKing from '../../../assets/images/pieces/white-king.png';
import blackKing from '../../../assets/images/pieces/black-king.png';

import defaultLogo from '../../../assets/icons/favicon.png';

export class GameRender {
  readonly dom: InjectorDOM;

  private content: IHTML = {
    gameSection: document.createElement('section'),
    workZone: document.createElement('div'),
    timerWrap: document.createElement('div'),
    fieldWrap: document.createElement('article'),
  };

  private letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  private numbers: string[] = ['1', '2', '3', '4', '5', '6', '7', '8'];

  public replayData: IReplayData = {
    whiteAvatar: ``,
    whiteHandicap: '',
    whitePlayer: '',
    winner: ``,
    blackHandicap: ``,
    blackPlayer: ``,
    blackAvatar: ``,
    gameTime: ``,
    turnsTime: [],
    turns: [],
  };

  private squaresData: ISquaresData = {
    first: {
      elem: document.createElement('div'),
      axisY: 0,
    },

    second: {
      elem: document.createElement('div'),
      axisY: 0,
    },

    axisX: 0,
  };

  private logLists: IHTML = {
    player: document.createElement('article'),
    opp: document.createElement('article'),
  };

  public handicapSquares: IText = {
    white: ``,
    black: ``,
  };

  private piecesDefaultPosition: IPiecesSetLoc = {
    white: {
      king: ['E1'],
      queen: ['D1'],
      rook: ['A1', 'H1'],
      bishop: ['C1', 'F1'],
      knight: ['B1', 'G1'],
      pawn: this.letters.map(x => `${x}2`),
    },

    black: {
      king: ['E8'],
      queen: ['D8'],
      rook: ['A8', 'H8'],
      bishop: ['C8', 'F8'],
      knight: ['B8', 'G8'],
      pawn: this.letters.map(x => `${x}7`),
    },
  };

  public piecesPosition: IPiecesSetLoc = JSON.parse(JSON.stringify(this.piecesDefaultPosition));

  public piecesPrediction: IPiecesSetLoc = JSON.parse(JSON.stringify(this.piecesDefaultPosition));

  public aiPiecePrediction: IPiecesSetLoc = JSON.parse(JSON.stringify(this.piecesDefaultPosition));

  private pieceClass = 'game__field__square__piece';

  public piecesDOMSet: IPiecesDOMSset = {
    white: {
      king: {
        ...this.generatePieceDOM('white king', whiteKing),
      },

      queen: {
        ...this.generatePieceDOM('white queen', whiteQueen),
      },

      rook: {
        ...this.generatePieceDOM('white rook', whiteRook),
      },

      bishop: {
        ...this.generatePieceDOM('white bishop', whiteBishop),
      },

      knight: {
        ...this.generatePieceDOM('white knight', whiteKnight),
      },

      pawn: {
        ...this.generatePieceDOM('white pawn', whitePawn),
      },
    },
    black: {
      king: {
        ...this.generatePieceDOM('black king', blackKing),
      },

      queen: {
        ...this.generatePieceDOM('black queen', blackQueen),
      },

      rook: {
        ...this.generatePieceDOM('black rook', blackRook),
      },

      bishop: {
        ...this.generatePieceDOM('black bishop', blackBishop),
      },

      knight: {
        ...this.generatePieceDOM('black knight', blackKnight),
      },

      pawn: {
        ...this.generatePieceDOM('black pawn', blackPawn),
      },
    },
  };

  public isReplayMode = false;

  public isActiveWhite = true;

  public isFirstPlayerWhite = true;

  private squaresList: string[] = [];

  public userPanel: IHTML = {};

  public gameField: HTMLElement = document.createElement('div');

  public squares: IHTML = {};

  public playerAvatar = ``;

  public oppAvatar = ``;

  private nameHeaders: IHTML = {
    player: document.createElement('h3'),
    opp: document.createElement('h3'),
  };

  private avatarsWrap: IHTML = {
    player: document.createElement('div'),
    opp: document.createElement('div'),
  };

  constructor() {
    this.dom = new InjectorDOM();
  }

  public resetBoardState(): void {
    this.piecesPosition = JSON.parse(JSON.stringify(this.piecesDefaultPosition));

    this.isActiveWhite = true;

    if (!this.isReplayMode) {
      this.handicapSquares.white = ``;
      this.handicapSquares.black = ``;
    }
  }

  public addGameSection(): void {
    const gameSection: IDOM = {
      tag: 'section',
      classes: 'game',
      parent: document.body,
    };

    this.content.gameSection = this.dom.push(gameSection);
    this.addGameFieldWrap();
  }

  public createQueen(queen: IDOM): HTMLImageElement {
    return this.dom.push(queen) as HTMLImageElement;
  }

  public addPlayersAvatars(firstAvatarData: string, secondAvatarData: string): void {
    this.playerAvatar = firstAvatarData || (defaultLogo as string);

    this.oppAvatar = secondAvatarData || (defaultLogo as string);

    const playerOneAvatar: IDOM = {
      tag: 'img',
      classes: 'game__user-panel__avatar',
      parent: this.avatarsWrap.player,
      attributes: [
        { attribute: 'src', value: `${this.playerAvatar}` },
        {
          attribute: 'alt',
          value: 'Player One Avatar',
        },
      ],
    };

    const playerTwoAvatar: IDOM = {
      ...playerOneAvatar,
      parent: this.avatarsWrap.opp,
      attributes: [
        { attribute: 'src', value: `${this.oppAvatar}` },
        {
          attribute: 'alt',
          value: 'Player Two Avatar',
        },
      ],
    };

    this.dom.push(playerOneAvatar);

    this.dom.push(playerTwoAvatar);
  }

  public async rotateBoard(): Promise<void> {
    return new Promise(resolve => {
      const animationTime = 1800;

      const reactionTime = 500;

      this.gameField.classList.add('inactive');

      setTimeout(() => {
        this.gameField.classList.add('change-turn');
        this.squaresList.forEach(square => {
          this.squares[square].classList.remove(
            `letters-bottom-visible`,
            `letters-top-visible`,
            `numbers-left-visible`,
            `numbers-right-visible`,
          );

          if (this.squares[square].firstElementChild) {
            this.squares[square].removeChild(this.squares[square].firstElementChild as HTMLElement);
          }
        });
      }, reactionTime);

      setTimeout(() => {
        this.gameField.remove();

        this.addGameField(this.isActiveWhite);

        this.gameField.classList.remove('inactive');

        resolve();
      }, animationTime);
    });
  }

  public addGameField(isActiveWhite: boolean): void {
    this.squaresList = [];

    const gameField: IDOM = {
      tag: 'div',
      classes: 'game__field',
      parent: this.content.fieldWrap,
    };

    this.gameField = this.dom.push(gameField) as HTMLDivElement;

    this.addSquares(isActiveWhite);
  }

  public highlightActivePlayer(): void {
    if (this.isFirstPlayerWhite === this.isActiveWhite) {
      this.userPanel.player.classList.add('active-player');
      this.userPanel.opp.classList.remove('active-player');
    } else {
      this.userPanel.opp.classList.add('active-player');
      this.userPanel.player.classList.remove('active-player');
    }
  }

  public addLog(log: string, isWhite: boolean): void {
    const parent = isWhite === this.isFirstPlayerWhite ? this.logLists.player : this.logLists.opp;

    const logDOM: IDOM = {
      tag: 'p',
      classes: 'game__user-panel__article__log',
      parent,
      innerText: `${log}`,
    };

    this.dom.push(logDOM);
  }

  private generatePieceDOM(name: string, piece: typeof import('*.png')): IDOM {
    return {
      tag: 'img',
      classes: this.pieceClass,
      parent: document.body,
      attributes: [
        {
          attribute: 'src',
          value: `${piece}`,
        },
        {
          attribute: 'alt',
          value: `${name}`,
        },
      ],
    };
  }

  private setPieces({ king, queen, rook, knight, bishop, pawn }: IPieceLoc, isWhite: boolean): void {
    const piecesSet = isWhite ? this.piecesDOMSet.white : this.piecesDOMSet.black;

    king.forEach(loc => this.dom.push({ ...piecesSet.king, parent: this.squares[loc] }));

    queen.forEach(loc => this.dom.push({ ...piecesSet.queen, parent: this.squares[loc] }));

    rook.forEach(loc => this.dom.push({ ...piecesSet.rook, parent: this.squares[loc] }));

    bishop.forEach(loc => this.dom.push({ ...piecesSet.bishop, parent: this.squares[loc] }));

    knight.forEach(loc => this.dom.push({ ...piecesSet.knight, parent: this.squares[loc] }));

    pawn.forEach(loc => this.dom.push({ ...piecesSet.pawn, parent: this.squares[loc] }));
  }

  private showDatasets(isActiveWhite: boolean): void {
    let bottomLetter: string;

    let topLetter: string;

    let topNumber: number;

    let bottomNumber: number;

    if (isActiveWhite) {
      bottomLetter = 'A';
      topLetter = 'H';
      topNumber = 8;
      bottomNumber = 1;
    } else {
      bottomLetter = 'H';
      topLetter = 'A';
      topNumber = 1;
      bottomNumber = 8;
    }

    this.numbers.forEach(num => {
      this.squares[`${bottomLetter}${num}`].classList.add('numbers-left-visible');
      this.squares[`${topLetter}${num}`].classList.add('numbers-right-visible');
    });

    this.letters.forEach(letter => {
      this.squares[`${letter}${topNumber}`].classList.add('letters-top-visible');
      this.squares[`${letter}${bottomNumber}`].classList.add('letters-bottom-visible');
    });
  }

  private getSquares(): IDOMSet {
    return {
      white: {
        tag: 'div',
        classes: 'game__field__square white',
        parent: this.gameField,
      },

      black: {
        tag: 'div',
        classes: 'game__field__square black',
        parent: this.gameField,
      },
    };
  }

  private addSquares(isActiveWhite: boolean): void {
    let isOdd = false;

    const chessboardSize = 8;

    const squares: IDOMSet = this.getSquares();

    for (let x = 0; x < chessboardSize; x++) {
      isOdd = !isOdd;

      for (let y = 0; y < chessboardSize; y += 2) {
        this.squaresList.push(`${this.letters[x]}${this.numbers[y]}`);

        this.squaresList.push(`${this.letters[x]}${this.numbers[y + 1]}`);

        this.changeSquareColorOnNewLine(isOdd, squares);

        this.generateBoardDataForActivePlayer(isActiveWhite, x, y);

        this.setSquareDataset(this.squaresData.first);

        this.setSquareDataset(this.squaresData.second);

        this.storeSquareDOM(this.squaresData.first);

        this.storeSquareDOM(this.squaresData.second);
      }
    }

    this.showDatasets(isActiveWhite);

    this.setAllPieces();
  }

  private storeSquareDOM(squareData: ISquareData): void {
    this.squares[`${this.letters[squareData.axisY]}${this.numbers[this.squaresData.axisX]}`] = squareData.elem;
  }

  private setSquareDataset(squareData: ISquareData): void {
    squareData.elem.dataset.letter = this.letters[squareData.axisY];

    squareData.elem.dataset.number = this.numbers[this.squaresData.axisX];
  }

  private changeSquareColorOnNewLine(isOdd: boolean, squares: IDOMSet): void {
    if (isOdd) {
      this.squaresData.first.elem = this.dom.push(squares.white);

      this.squaresData.second.elem = this.dom.push(squares.black);
    } else {
      this.squaresData.first.elem = this.dom.push(squares.black);

      this.squaresData.second.elem = this.dom.push(squares.white);
    }
  }

  private generateBoardDataForActivePlayer(isActiveWhite: boolean, x: number, y: number): void {
    const axisLimit = 7;

    if (isActiveWhite) {
      this.squaresData.first.axisY = y;

      this.squaresData.second.axisY = y + 1;

      this.squaresData.axisX = axisLimit - x;
    } else {
      this.squaresData.first.axisY = axisLimit - y;

      this.squaresData.second.axisY = axisLimit - y - 1;

      this.squaresData.axisX = x;
    }
  }

  private setAllPieces(): void {
    this.setPieces(this.piecesPosition.white, true);
    this.setPieces(this.piecesPosition.black, false);
  }

  private addGameFieldWrap(): void {
    const gameFieldWrap: IDOM = {
      tag: 'div',
      classes: 'working-zone game__wrap',
      parent: this.content.gameSection,
    };

    this.content.workZone = this.dom.push(gameFieldWrap);

    this.addTimerWrap();

    this.addGameWrap();
  }

  private addGameWrap(): void {
    const fieldWrap: IDOM = {
      tag: 'article',
      classes: 'game__field-wrap',
      parent: this.content.workZone,
    };

    this.content.fieldWrap = this.dom.push(fieldWrap);

    this.addUsersPanels();

    this.addGameField(this.isActiveWhite);
  }

  private addTimerWrap(): void {
    const timerWrap: IDOM = {
      tag: 'div',
      classes: 'game__timer',
      parent: this.content.workZone,
    };

    this.content.timerWrap = this.dom.push(timerWrap);

    this.addTimerElem();
  }

  private addTimerElem(): void {
    const timerElem: IDOM = {
      tag: 'p',
      classes: 'game__timer__count',
      parent: this.content.timerWrap,
      innerText: '00:00',
    };

    store.timerElem = this.dom.push(timerElem) as HTMLParagraphElement;
  }

  private addUsersPanels(): void {
    const userPanel: IDOM = {
      tag: 'article',
      classes: 'game__user-panel player',
      parent: this.content.fieldWrap,
    };

    this.userPanel.player = this.dom.push(userPanel);

    this.userPanel.opp = this.dom.push({
      ...userPanel,
      classes: 'game__user-panel opp',
    });

    this.highlightActivePlayer();

    this.addAvatarsWrap();

    this.addPlayersNamesHeaders();

    this.addLogLists();
  }

  private addAvatarsWrap(): void {
    const playerOneAvatarWrap: IDOM = {
      tag: 'div',
      classes: 'game__user-panel__avatar-wrap',
      parent: this.userPanel.player,
    };

    const playerTwoAvatarWrap: IDOM = {
      ...playerOneAvatarWrap,
      parent: this.userPanel.opp,
    };

    this.avatarsWrap.player = this.dom.push(playerOneAvatarWrap);

    this.avatarsWrap.opp = this.dom.push(playerTwoAvatarWrap);
  }

  private addPlayersNamesHeaders(): void {
    const playerOneNameHeader: IDOM = {
      tag: 'h3',
      classes: 'game__user-panel__header',
      parent: this.userPanel.player,
      innerText: `${store.playerOneName}`,
    };

    const playerTwoNameHeader: IDOM = {
      ...playerOneNameHeader,
      parent: this.userPanel.opp,
      innerText: `${store.playerTwoName}`,
    };

    this.nameHeaders.player = this.dom.push(playerOneNameHeader);

    this.nameHeaders.opp = this.dom.push(playerTwoNameHeader);
  }

  private addLogLists(): void {
    this.highlightActivePlayer();

    const logListPlayer: IDOM = {
      tag: 'article',
      classes: 'game__user-panel__article',
      parent: this.userPanel.player,
    };

    const logListOpp: IDOM = {
      ...logListPlayer,
      parent: this.userPanel.opp,
    };

    this.logLists.player = this.dom.push(logListPlayer);

    this.logLists.opp = this.dom.push(logListOpp);
  }
}
