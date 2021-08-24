/**
 * Yes, MetaTTT can be represented as a graph theory tree
 */
import { defaultGameConfig, GameConfig } from "../config";

/**
 * OPEN means the node can be taken
 * LOCKED means the node is empty but can't be taken
 * DRAW means the node is full but no one took it
 */
export enum StateEnum {
  OPEN = 'O',
  LOCKED = 'L',
  DRAW = 'D',
}

/** the state of a Square (terminal node) */
export interface SquareState {
  /** the state of the Square */
  s: StateEnum | number
}

/** the state of a Board (node) */
export interface BoardState extends SquareState {
  /** the id of that node, equivalent to its position */
  [N: number]: SquareState | BoardState
}

/** the state of a MetaBoard (root node) */
export interface MetaBoardState extends BoardState {
  /** the position of the currently unlocked board. null means all boards are open. */
  openBoard: number | null
  /** the game config */
  config: GameConfig
}

export function createBoard(options?: { config?: GameConfig }) {
  const { config = defaultGameConfig } = options ?? {}
  const newNode: SquareState = { s: StateEnum.OPEN }
  const sizeArr = [...Array(config.size ** 2).keys()]

  return {
    config,
    openBoard: null,
    ...newNode,
    ...sizeArr.map(() => ({
      ...newNode,
      ...sizeArr.map(() => newNode)
    }))
  } as MetaBoardState
}

const isTaken = ({ s }: SquareState) => s === StateEnum.DRAW || typeof s === 'number'
const isOpen = ({ s }: SquareState) => s === StateEnum.OPEN
const isLocked = ({ s }: SquareState) => s === StateEnum.LOCKED || isTaken({ s })
const getTaker = ({ s }: SquareState) => isTaken({ s }) ? s : null

/** Trying to make all state API style so easier to modify how it works in the future without rewriting UI/server code */
export default {
  isOpen, isTaken, isLocked, getTaker, createBoard, StateEnum
}
