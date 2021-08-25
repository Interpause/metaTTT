import { NodeState } from "../state/BoardState"
import { GameState } from "../state/GameState"

export enum BoardActionEnum {
  PLACE = 'place',
  REDO = 'redo',
  UNDO = 'undo',
  GOTO_TURN = 'gotoTurn',
  RESTART = 'restart',
  APPLY_TURN = 'applyTurn'
}

export type Move = {
  coord: [number, number]
  player: number
}
export type BoardAction = {
  action: BoardActionEnum.PLACE
  move: [number, number]
}

export function createBoardReducer(game: GameState){
  return (ini: NodeState, action: BoardAction) => {
    switch(action.action){
      case BoardActionEnum.PLACE:
        break
    }
    return ini
  }
}

/**
 * GameReducer uses config of GameState to act as game engine to transform BoardState
 * should it therefore be called BoardReducer instead?
 * then GameReducer deals with changing Game like add players, change config
 * ...no roomReducer?? or is this third layer controlled by the server?
 */