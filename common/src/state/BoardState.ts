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
}

export function createBoard(options?: { config?: GameConfig }) {
  const { config = defaultGameConfig } = options ?? {}
  const newNode: SquareState = { s: StateEnum.OPEN }
  const sizeArr = [...Array(config.size ** 2).keys()]

  return {
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

//Dont do recursive locks anymore, just lock at the Board level so patches are smaller
//This is overoptimization
//Using s for state makes it damn obvious when you are directly accessing rather than using your API
//I just did the same for the other props... good luck me, API access should be damm obvious now
//only code in common is allowed to bypass API access
/**
 * seriously think about what belong in boardState vs gameState
 * I dont think config should be in boardState, it shouldnt change action to action
 * so config should be either gameState or even roomState
 * currentBoard might not be necessary at all; after all currentBoard should already be open due to previous turn
 * turn might be gameState level
 * BoardState could be bare minimum to render GUI, keep track of state
 * turn and history might be gameState level
 */