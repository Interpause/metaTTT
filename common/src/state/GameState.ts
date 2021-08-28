import { defaultGameConfig, GameConfig } from "../config/GameConfig";
import { GameError } from "../enums";
import { Move } from "../reducers/BoardProducer";
import { createBoard, NodeState, bUtil, NodeEnum } from "./BoardState";

export interface GameState {
  board: NodeState
  turn: number
  history: any[] //TODO: define Turn
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

/** converts 1D coord to 2D given board size */
const o2D = (s: number, c: number) => [c % s, ~~(c / s)] as [number, number]
/** converts 2D coord to 1D given board size */
const t1D = (s: number, [x, y]:[number, number]) => y * s + x

export const gUtil = {
  getTurn: ({history}:GameState, turn: number) => history.at(turn),
  getLastTurn: ({history}:GameState) => history.at(-1),
  getTotalTurns: ({history}:GameState) => history.length,
  getCurrentPlayer: ({turn, config: {numPlayers}}:GameState) => turn % numPlayers,
  checkNode: ({checks, numLineWin, size}:GameConfig, board: NodeState) => {
    const squares = bUtil.getChildren(board)
    if(!squares) return bUtil.getTaker(board)

    let isFull = true
    for(const [n, square] of Object.entries(squares)){
      if(isFull && !bUtil.isFull(square)) isFull = false
      const winner = bUtil.getTaker(square)
      if(!winner) continue

      const isWin = checks.some(([dx, dy]) => {
        let [x, y] = o2D(size, parseInt(n))
        for(let i = 1; i < numLineWin; i++){
          const c = t1D(size, [(x += dx), (y += dy)])
          if(!squares[c] || bUtil.getTaker(squares[c]!) !== winner) return false
        }
        return true
      })
      if(isWin) return winner
    }
    if (isFull) return NodeEnum.DRAW
    else return board.s
  },
  validate(game: GameState, move: Move) {
    const { player, coord: [c1, c2] } = move
    const { board } = game
    const square = board[c1]?.[c2]
    if(!square) throw GameError.ILLEGAL_MOVE_COORD
    else if(bUtil.isFull(square)) throw GameError.ILLEGAL_MOVE_OCCUPIED
    else if(bUtil.isLocked(square)) throw GameError.ILLEGAL_MOVE_LOCKED
    else if(player != gUtil.getCurrentPlayer(game)) throw GameError.ILLEGAL_MOVE_TURN
  }
}
