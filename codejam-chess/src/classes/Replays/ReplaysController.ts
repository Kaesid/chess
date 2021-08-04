import store from '../../store';
import { Render } from '../render/Render';

export class ReplaysController {
  private readonly render: Render;

  constructor(render: Render) {
    this.render = render;
  }

  public setReplayData(): void {
    this.render.game.isReplayMode = true;

    store.replayTimeSpeed = 1;

    store.playerOneName = this.render.game.replayData.whitePlayer;

    store.playerTwoName = this.render.game.replayData.blackPlayer;

    this.render.game.handicapSquares.white = this.render.game.replayData.whiteHandicap;

    this.render.game.handicapSquares.black = this.render.game.replayData.blackHandicap;
  }
}
