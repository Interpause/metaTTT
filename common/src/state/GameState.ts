import { Patch, enablePatches } from "immer";
import { defaultGameConfig, GameConfig } from "../config/GameConfig";
import { createBoard, nodeWrapper, NodeState } from "./BoardState";
export type { Patch } from "immer";
enablePatches()

export interface GameState {
  board: NodeState
  turn: number
  history: Patch[]
  config: GameConfig
}

export function createGame(config?: Partial<GameConfig>){
  return {
    board: createBoard(config),
    turn: 0,
    history: [],
    config: {...defaultGameConfig, ...config}
  } as GameState
}

export function gameWrapper({board, turn, history, config}: GameState){
  const getBoard = () => nodeWrapper(board)
  const getTurn = () => turn
  const getHistory = () => history
  const getTurnNo = (t: number) => history.at(t)
  const getLastTurn = () => getTurnNo(-1)
  const getTotalTurns = () => history.length
  const getNumPlayers = () => config.numPlayers
  const getCurrentPlayer = () => getTurn() % getNumPlayers()

  return {
    getBoard,
    getTurn,
    getHistory,
    getTurnNo,
    getLastTurn,
    getTotalTurns,
    getNumPlayers,
    getCurrentPlayer
  }

}