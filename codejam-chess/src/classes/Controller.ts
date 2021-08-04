import { DatabaseHandler } from './shared/DatabaseHandler';
import { MatchGame } from './game/GameController';
import { MiscAlgorithms } from './shared/MiscAlgorithms';
import { clearPage, goToGamePage, goToLobby, preventSelectWhenDraggingPieces } from '../store';
import { IText } from '../intefaces';
import { Render } from './render/Render';
import { LobbyController } from './Lobby/LobbyController';
import { ReplaysController } from './Replays/ReplaysController';

export class Controller {
  private readonly render: Render;

  private readonly db: DatabaseHandler;

  private readonly calc: MiscAlgorithms;

  private readonly game: MatchGame;

  private readonly lobby: LobbyController;

  private readonly replays: ReplaysController;

  private headerClickTarget: HTMLElement | undefined;

  private readonly pagesList: IText = {
    main: 'Lobby',
    settings: 'Settings',
    replays: 'Replays',
    game: 'Game',
  };

  private url = '';

  constructor() {
    this.render = new Render();

    this.calc = new MiscAlgorithms();

    this.db = new DatabaseHandler();

    this.game = new MatchGame(this.render);

    this.lobby = new LobbyController(this.render);

    this.replays = new ReplaysController(this.render);
  }

  start(): void {
    this.changePage(window.location.hash);

    this.setHashListener();

    preventSelectWhenDraggingPieces();
  }

  private setHashListener(): void {
    window.onhashchange = () => this.changePage(window.location.hash);
  }

  private async changePage(location: string): Promise<void> {
    this.game.resetGameDataOnGameFinish();

    clearPage();

    await this.choosePage(location);

    this.setHeaderNavigation();
  }

  private async choosePage(url: string): Promise<void> {
    this.url = url;

    switch (true) {
      case this.isReplays():
        await this.loadReplays();

        break;
      case this.isGame():
        this.loadGame();

        break;
      case this.isLobby():
        this.loadLobby();

        break;
      default:
        goToLobby();
    }
  }

  private isLobby(): boolean {
    return this.calc.checkAdress(this.pagesList.main, this.url);
  }

  private isReplays(): boolean {
    return this.calc.checkAdress(this.pagesList.replays, this.url);
  }

  private isGame(): boolean {
    return this.calc.checkAdress(this.pagesList.game, this.url);
  }

  private setHeaderNavigation(): void {
    this.render.header.section.navList.onclick = event => this.headerNavigation(event);
  }

  private headerNavigation(event: Event): void {
    this.headerClickTarget = event.target as HTMLElement;

    if (this.headerClickTarget.classList.contains('header__nav__list__item__link')) {
      const clickedLinkAdress = this.headerClickTarget.dataset.link as string;

      window.location.hash = clickedLinkAdress;
    }
  }

  private loadLobby(): void {
    this.render.createAboutPage();

    this.lobby.loadLogic();
  }

  private async loadReplays(): Promise<void> {
    await this.render.createReplaysPage();

    this.render.replays.replays.replaysWrap.onclick = e => this.checkReplayButton(e);
  }

  async checkReplayButton(event: MouseEvent): Promise<void> {
    const elem = event.target as HTMLElement;

    if (elem.classList.contains(`replays__replay__button`) && elem.dataset.id) {
      this.render.game.replayData = await this.db.getById(+elem.dataset.id);

      this.setReplayData();

      goToGamePage();
    }
  }

  setReplayData(): void {
    this.lobby.setAvatarsData();

    this.replays.setReplayData();
  }

  private loadGame(): void {
    this.render.createGamePage();

    this.render.game.addPlayersAvatars(this.lobby.playerOneAvatar.canvasURL, this.lobby.playerTwoAvatar.canvasURL);

    this.game.loadLogic();
  }
}
