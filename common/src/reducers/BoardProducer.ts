import { produce, enablePatches, Patch } from "immer"
export type { Patch } from "immer"
enablePatches()
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

// validate probably is in GameReducer, which then calls BoardProducer

/** has side effect where game gets Turns added to its history */
export function getBoardProducer(game: GameState){
  produce((draft:NodeState, action:BoardAction) => {
  },
  undefined,
  //Patch listener.
  )
}

/**
 * GameReducer uses config of GameState to act as game engine to transform BoardState
 * should it therefore be called BoardReducer instead?
 * then GameReducer deals with changing Game like add players, change config
 * ...no roomReducer?? or is this third layer controlled by the server?
 * is boardReducer recreated for each game? maybe.
 * probably isnt used directly by any context, is embedded into higher layer reducer
 * as all state is immutable, this reducer has to be recreated each time
 * soo getBoardReducer(gameStateDraft) ig
 */