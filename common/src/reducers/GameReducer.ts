export enum GameActionEnum {
  PLACE,
  REDO,
  UNDO,
  GOTO_TURN,
  RESTART,
  APPLY_TURN
}

export type Move = {
  coord: [number, number]
  player: number
}
export type GameAction = {
  action: GameActionEnum.PLACE
  move: [number, number]
}

export function gameReducer() {}