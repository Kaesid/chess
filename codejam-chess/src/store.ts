export default {
  timerElem: document.createElement('p'),

  popup: document.createElement('section'),

  settingsForm: document.createElement('form'),

  playerOneName: '',

  playerTwoName: '',

  url: '',

  serverUrl: `wss://nameless-spire-06593.herokuapp.com`,

  replayTimeSpeed: 1,

  serverGameNumber: 0,

  isAnimationInProgress: false,

  isTimerCanRestart: true,
};

export function clearPage(): void {
  document.body.innerHTML = '';
}

export function getSquareCoord(elem: HTMLElement): string {
  let squares = ``;

  const parent = elem.parentElement as HTMLElement;

  if (elem.dataset.letter) {
    squares = `${elem.dataset.letter}${elem.dataset.number}`;
  } else if (parent.dataset.letter) {
    squares = `${parent.dataset.letter}${parent.dataset.number}`;
  }

  return squares;
}

export function getSquares(squares: string): string[] {
  if (squares) {
    const upSquares = squares.toUpperCase();

    return [`${upSquares[0]}${upSquares[1]}`, `${upSquares[2]}${upSquares[3]}`];
  }
  const ImpossibleTurn = [`Z9`, `X9`];

  return ImpossibleTurn;
}

export function preventSelectWhenDraggingPieces(): void {
  document.body.onselectstart = e => e.preventDefault();
}

export function getSeconds(timeString: string): number {
  const secInMinute = 60;

  return +timeString.split(`:`)[0] * secInMinute + +timeString.split(`:`)[1];
}

export function goToGamePage(): void {
  window.location.hash = '#/Game/';
}

export function goToLobby(): void {
  window.location.hash = '#/Lobby/';
}

export function goToReplaysPage(): void {
  window.location.hash = '#/Replays/';
}
