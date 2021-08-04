export interface IDOM {
  tag: string;
  classes?: string;
  parent: Element;
  innerText?: string;
  attributes?: IAttributes[];
}

export interface IDOMSet {
  [key: string]: IDOM;
}

export interface IUserData {
  name: string;
  surname: string;
  email: string;
  score: number;
  avatar: string;
  id: number;
}

export interface IReplayData {
  id?: number;
  winner: string;
  whitePlayer: string;
  blackPlayer: string;
  whiteAvatar: string;
  blackAvatar: string;
  whiteHandicap: string;
  blackHandicap: string;
  gameTime: string;
  turns: string[];
  turnsTime: string[];
}

export interface IMessage {
  content: string;
  type: string;
}

export interface ISquaresData {
  first: ISquareData;
  second: ISquareData;
  axisX: number;
}

export interface ISquareData {
  elem: HTMLElement;
  axisY: number;
}
export interface IBase {
  eco: string;
  name: string;
  fen: string;
  moves: string;
}

export interface IAttributes {
  attribute: string;
  value: string;
}

export interface ISelect {
  [key: string]: HTMLSelectElement;
}

export interface IText {
  [key: string]: string;
}

export interface ITurnsValue {
  squares: string;
  value: number;
  leadTo?: IMovesValues;
}

export interface IMovesValues {
  [key: string]: number;
}

export interface IPiecesValues {
  [key: string]: IPieceValues;
  king: IPieceValues;
  queen: IPieceValues;
  rook: IPieceValues;
  bishop: IPieceValues;
  knight: IPieceValues;
  pawn: IPieceValues;
}

export interface IPieceValues {
  lose: number;
  take: number;
}

export interface INumber {
  [key: string]: number;
}

export interface IFlag {
  [key: string]: boolean;
}

export interface IHTML {
  [key: string]: HTMLElement;
}

export interface IHTMLSet {
  [key: string]: IHTML;
}

export interface IInputSet {
  input: HTMLInputElement;
  save: HTMLButtonElement;
}
export interface IPieceLoc {
  [text: string]: string[];
  king: string[];
  queen: string[];
  rook: string[];
  bishop: string[];
  knight: string[];
  pawn: string[];
}

export interface ISquaresSet {
  [text: string]: string[];
  white: string[];
  black: string[];
  all: string[];
}

export interface IUpdatePieceData {
  [text: string]: IPiecesSetLoc | IPieceInfo | string;
  set: IPiecesSetLoc;
  piece: IPieceInfo;
  to: string;
}

export interface IPiecesSetLoc {
  [text: string]: IPieceLoc;
  white: IPieceLoc;
  black: IPieceLoc;
}

export interface ICanvasSet {
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  loadInput: HTMLInputElement;
  upload: HTMLElement;
  reset: HTMLButtonElement;
}

export interface ISquaresActions {
  moves: string[];
  attacks: string[];
  uiMoves: string[];
  potentialAttacks: string[];
}

export interface IGameData {
  turns: string[];
  time: string[];
}

export interface IPieceParams {
  [text: string]: string | HTMLImageElement;
  HTML: HTMLImageElement;
  color: string;
  figure: string;
}

export interface ISquareParams {
  [text: string]: IPieceParams | HTMLElement | number;
  squareHTML: HTMLElement;
  arrIndex: number;
  piece: IPieceParams;
}

export interface ISubmitEvent {
  submitter: Record<string, unknown>;
}

export interface IPieceInfo {
  isWhite: boolean;
  isUnderAttack: boolean;
  square: string;
  pieceName: string;
  actions: ISquaresActions;
}
export interface IPiecesDOM {
  king: IDOM;
  queen: IDOM;
  rook: IDOM;
  bishop: IDOM;
  knight: IDOM;
  pawn: IDOM;
}

export interface IPiecesDOMSset {
  [text: string]: IPiecesDOM;
  white: IPiecesDOM;
  black: IPiecesDOM;
}

export interface IChessPiece {
  piece: string;
  square: string;
}
export interface IChessMove {
  piece: HTMLImageElement;
  from: string;
  to: string;
}
export interface IPieceMove {
  x: number;
  y: number;
}
