import { IText } from '../../intefaces';
import store from '../../store';

import { HeaderRender } from './components/HeaderRender';
import { LobbyRender } from './components/LobbyRender';
import { GameRender } from './components/GameRender';
import { ReplaysRender } from './components/ReplaysRender';
import { PopupRender } from './components/PopupRender';

function checkIfPlayerNameEmpty(): void {
  if (!store.playerOneName) {
    store.playerOneName = 'Player 1';
  }

  if (!store.playerTwoName) {
    store.playerTwoName = 'Player 2';
  }
}

export class Render {
  public readonly game: GameRender;

  public readonly header: HeaderRender;

  public readonly lobby: LobbyRender;

  public readonly replays: ReplaysRender;

  public readonly popup: PopupRender;

  private isBlackActiveWithoutTurn = false;

  public netEnemyHandicap = ``;

  public isPlayerWhiteServer = false;

  constructor() {
    this.replays = new ReplaysRender();

    this.lobby = new LobbyRender();

    this.header = new HeaderRender();

    this.game = new GameRender();

    this.popup = new PopupRender();
  }

  public createHeader(): void {
    this.header.addHeader();
  }

  public createGamePage(): void {
    this.createHeader();

    this.header.setGameMode();

    if (this.game.isReplayMode) {
      (this.header.section.yieldButton.firstElementChild as HTMLElement).innerText = `End replay`;
      (this.header.section.drawOfferButton.firstElementChild as HTMLElement).innerText = `Select replay`;

      this.header.section.yieldButton.classList.add('relocate-element');
    } else {
      checkIfPlayerNameEmpty();
    }

    this.game.resetBoardState();

    if (this.game.isReplayMode) {
      this.setReplayParams();
      this.header.addReplaySpeedControl();
    } else {
      this.setSettings();
    }

    this.game.addGameSection();

    if (this.isBlackActiveWithoutTurn) {
      this.isBlackActiveWithoutTurn = false;
      this.game.gameField.remove();
      this.game.addGameField(!this.game.isActiveWhite);
    }

    if (this.game.isReplayMode) {
      this.setSpectatorMode();
    }
  }

  public createAboutPage(): void {
    this.createHeader();
    this.header.navLinks.lobby.classList.add('link-active');
    this.lobby.addAboutPage();
  }

  public async createReplaysPage(): Promise<void> {
    this.createHeader();

    this.header.navLinks.replays.classList.add('link-active');

    await this.replays.addReplaysPage();
  }

  public genererateEndGamepopup(results: IText): void {
    this.header.section.content.classList.add('modal-window-background');

    this.header.setGameModeOff();

    this.popup.addEndgamePopup(results);
  }

  private setReplayParams(): void {
    this.isBlackActiveWithoutTurn = false;

    this.game.isFirstPlayerWhite = true;

    if (this.game.handicapSquares.white) {
      this.game.piecesPosition.white.queen.length--;
    }

    if (this.game.handicapSquares.black) {
      this.game.piecesPosition.black.queen.length--;
    }
  }

  private setSpectatorMode(): void {
    this.game.gameField.classList.add(`replay-mode`);

    if (this.game.replayData.winner === `white`) {
      this.game.userPanel.player.classList.add(`winner`, `winner-game`);
    } else if (!this.game.replayData.winner) {
      this.game.userPanel.player.classList.add(`winner`, `winner-game`);
      this.game.userPanel.opp.classList.add(`winner`, `winner-game`);
    } else {
      this.game.userPanel.opp.classList.add(`winner`, `winner-game`);
    }
  }

  private setSettings(): void {
    this.setTeams();

    this.setHandicap();
  }

  private setHandicap(): void {
    const handicap = this.lobby.selectSet.handicap.value;

    this.setServerGameHandicap();

    if (handicap) {
      const [player, piece] = handicap.split(' ');

      if ((this.game.isFirstPlayerWhite && player === `1`) || (!this.game.isFirstPlayerWhite && player !== `1`)) {
        this.storeHandicapSquares(piece, true);

        this.game.piecesPosition.white[piece].length--;
      } else {
        this.storeHandicapSquares(piece, false);

        this.game.piecesPosition.black[piece].length--;
      }
    }
  }

  private setServerGameHandicap(): void {
    if (this.lobby.IsServerGameMode() && this.netEnemyHandicap) {
      const piece = this.netEnemyHandicap.split(` `)[1];

      this.netEnemyHandicap = ``;

      if (this.isPlayerWhiteServer) {
        this.storeHandicapSquares(piece, false);

        this.game.piecesPosition.black[piece].length--;
      } else {
        this.storeHandicapSquares(piece, true);

        this.game.piecesPosition.white[piece].length--;
      }
    }
  }

  private storeHandicapSquares(piece: string, isWhite: boolean): void {
    if (isWhite) {
      this.game.handicapSquares.white =
        this.game.piecesPosition.white[piece][this.game.piecesPosition.white[piece].length - 1];
    } else {
      this.game.handicapSquares.black =
        this.game.piecesPosition.black[piece][this.game.piecesPosition.black[piece].length - 1];
    }
  }

  private setTeams(): void {
    if (!this.lobby.IsServerGameMode()) {
      const team = this.lobby.selectSet.team.value;

      const dice = Math.trunc(Math.random() * 2);

      const randomMode = !!(team === 'random' || !team);

      if (team === 'black' || (randomMode && dice === 1)) {
        this.game.isFirstPlayerWhite = false;
        if (!this.lobby.IsLocalGame()) {
          this.isBlackActiveWithoutTurn = true;
        }
      } else {
        this.game.isFirstPlayerWhite = true;
      }
    } else if (this.isPlayerWhiteServer) {
      this.game.isFirstPlayerWhite = true;
    } else {
      this.game.isFirstPlayerWhite = false;
      this.isBlackActiveWithoutTurn = true;
    }
  }
}
