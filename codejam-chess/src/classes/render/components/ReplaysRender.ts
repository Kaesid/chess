import { IHTML, IReplayData, IDOM } from '../../../intefaces';

import { InjectorDOM } from '../../shared/InjectorDOM';

import { DatabaseHandler } from '../../shared/DatabaseHandler';

export class ReplaysRender {
  private readonly dom: InjectorDOM;

  private readonly db: DatabaseHandler;

  public replaysData: IReplayData[] = [];

  private replayData: IReplayData = {
    winner: ``,
    whitePlayer: ``,
    blackPlayer: ``,
    whiteAvatar: ``,
    blackAvatar: '',
    whiteHandicap: '',
    blackHandicap: ``,
    gameTime: ``,
    turns: [],
    turnsTime: [],
  };

  public replays: IHTML = {
    content: document.createElement(`section`),
    workZone: document.createElement(`div`),
    replaysWrap: document.createElement(`div`),
    replay: document.createElement(`article`),
    playerWrapWhite: document.createElement(`div`),
    playerWrapBlack: document.createElement(`div`),
    stats: document.createElement(`div`),
    playerAvatarWrapWhite: document.createElement(`div`),
    playerAvatarWrapBlack: document.createElement(`div`),
    buttonWrap: document.createElement(`div`),
    playerNameWhite: document.createElement(`h3`),
    playerNameBlack: document.createElement(`h3`),
  };

  constructor() {
    this.dom = new InjectorDOM();

    this.db = new DatabaseHandler();
  }

  public async addReplaysPage(): Promise<void> {
    await this.getReplaysData();

    const scoreTable: IDOM = {
      tag: 'section',
      classes: 'replays',
      parent: document.body,
    };

    this.replays.content = this.dom.push(scoreTable);

    this.addWorkZone();
  }

  public async getReplaysData(): Promise<void> {
    this.replaysData = await this.db.getAll();
  }

  private addWorkZone(): void {
    const workZone: IDOM = {
      tag: 'div',
      classes: 'working-zone',
      parent: this.replays.content,
    };

    this.replays.workZone = this.dom.push(workZone);

    this.addHeader();

    this.addReplaysWrap();
  }

  private addHeader(): void {
    const header: IDOM = {
      tag: 'h2',
      classes: 'replays__header',
      parent: this.replays.workZone,
      innerText: 'Replays',
    };

    this.dom.push(header);
  }

  private addReplaysWrap(): void {
    const replayWrap: IDOM = {
      tag: 'div',
      classes: 'replays__replays-wrap',
      parent: this.replays.workZone,
    };

    this.replays.replaysWrap = this.dom.push(replayWrap);

    this.replaysData.forEach(replay => {
      this.replayData = JSON.parse(JSON.stringify(replay));

      this.addReplay();
    });
  }

  private addReplay(): void {
    const replay: IDOM = {
      tag: 'article',
      classes: 'replays__replay',
      parent: this.replays.replaysWrap,
    };

    this.replays.replay = this.dom.push(replay);

    this.addPlayersTabs();

    this.addStats();
  }

  private addPlayersTabs(): void {
    const playerTab: IDOM = {
      tag: 'div',
      classes: `replays__replay__player-tab`,
      parent: this.replays.replay,
    };

    this.replays.playerWrapWhite = this.dom.push(playerTab);

    this.replays.playerWrapBlack = this.dom.push(playerTab);

    this.addPlayersNames();

    this.addAvatarsWraps();
  }

  private addPlayersNames(): void {
    const whitePlayerName: IDOM = {
      tag: 'h3',
      classes: 'replays__replay__player-tab__name white',
      parent: this.replays.playerWrapWhite,
      innerText: `${this.replayData.whitePlayer}`,
    };

    const blackPlayerName: IDOM = {
      tag: 'h3',
      classes: 'replays__replay__player-tab__name black',
      parent: this.replays.playerWrapBlack,
      innerText: `${this.replayData.blackPlayer}`,
    };

    this.replays.playerNameWhite = this.dom.push(whitePlayerName);

    this.replays.playerNameBlack = this.dom.push(blackPlayerName);
  }

  private addStats(): void {
    const replayStats: IDOM = {
      tag: 'div',
      classes: 'replays__replay__stats',
      parent: this.replays.replay,
    };

    this.replays.stats = this.dom.push(replayStats);

    this.addTime();

    this.addTurnsNumber();

    this.addScore();

    this.addReplayButtonWrap();
  }

  private addScore(): void {
    let scoreValue = ``;

    if (!this.replayData.winner) {
      scoreValue = `0.5 - 0.5`;

      this.replays.playerNameWhite.classList.add(`winner`);
      this.replays.playerNameBlack.classList.add(`winner`);
    } else if (this.replayData.winner === `white`) {
      scoreValue = `1 - 0`;

      this.replays.playerNameWhite.classList.add(`winner`);
    } else {
      scoreValue = `0 - 1`;

      this.replays.playerNameBlack.classList.add(`winner`);
    }

    const score: IDOM = {
      tag: 'h3',
      classes: 'replays__replay__stats__item',
      parent: this.replays.stats,
      innerText: scoreValue,
    };

    this.dom.push(score);
  }

  private addTime(): void {
    const replayTime: IDOM = {
      tag: 'h3',
      classes: 'replays__replay__stats__item',
      parent: this.replays.stats,
      innerText: `Time: ${this.replayData.gameTime}`,
    };

    this.dom.push(replayTime);
  }

  private addTurnsNumber(): void {
    const turnsNumber: IDOM = {
      tag: 'h3',
      classes: 'replays__replay__stats__item',
      parent: this.replays.stats,
      innerText: `Turns: ${this.replayData.turns.length}`,
    };

    this.dom.push(turnsNumber);
  }

  private addReplayButtonWrap(): void {
    const replayButtonWrap: IDOM = {
      tag: 'div',
      classes: 'replays__replay__button-wrap',
      parent: this.replays.stats,
    };

    this.replays.buttonWrap = this.dom.push(replayButtonWrap);

    this.addReplayButton();
  }

  private addReplayButton(): void {
    const replayButtonWrap: IDOM = {
      tag: 'button',
      classes: 'register-button replays__replay__button',
      parent: this.replays.buttonWrap,
      innerText: `Watch replay`,
      attributes: [
        {
          attribute: 'data-id',
          value: `${this.replayData.id}`,
        },
      ],
    };

    this.dom.push(replayButtonWrap);
  }

  private addAvatarsWraps(): void {
    const whitePlayerAvatarWrap: IDOM = {
      tag: 'div',
      classes: 'replays__replay__player-tab__avatar-wrap',
      parent: this.replays.playerWrapWhite,
    };

    const blackPlayerAvatarWrap: IDOM = {
      ...whitePlayerAvatarWrap,
      parent: this.replays.playerWrapBlack,
    };

    this.replays.playerAvatarWrapWhite = this.dom.push(whitePlayerAvatarWrap);

    this.replays.playerAvatarWrapBlack = this.dom.push(blackPlayerAvatarWrap);

    this.addAvatars();
  }

  private addAvatars(): void {
    const whitePlayerAvatar: IDOM = {
      tag: 'img',
      classes: 'replays__replay__player-tab__avatar',
      parent: this.replays.playerAvatarWrapWhite,
      attributes: [
        {
          attribute: 'alt',
          value: 'White player avatar',
        },
        {
          attribute: 'src',
          value: `${this.replayData.whiteAvatar}`,
        },
      ],
    };

    const blackPlayerAvatar: IDOM = {
      ...whitePlayerAvatar,
      parent: this.replays.playerAvatarWrapBlack,
      attributes: [
        {
          attribute: 'alt',
          value: 'Black player avatar',
        },
        {
          attribute: 'src',
          value: `${this.replayData.blackAvatar}`,
        },
      ],
    };

    this.dom.push(whitePlayerAvatar);

    this.dom.push(blackPlayerAvatar);
  }
}
