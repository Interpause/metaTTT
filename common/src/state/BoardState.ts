/**
 * Yes, MetaTTT can be represented as a graph theory tree
 */
import { cloneDeep, merge } from "lodash";
import { defaultGameConfig, GameConfig } from "../config";

/**
 * OPEN means the node can be taken
 * LOCKED means the node is empty but can't be taken
 * DRAW means the node is full but no one took it
 */
export enum NodeEnum {
  OPEN = 'O',
  LOCKED = 'L',
  DRAW = 'D',
}

/** the state of a Square/Board/MetaBoard (recursion!) */
export interface NodeState {
  /** state or player N who has taken the node  */
  s: NodeEnum | number
  /** the id of that node, equivalent to its position */
  [N: number]: NodeState
}

/** creates an empty board using defaultGameConfig & config */
export function createBoard(config?: Partial<GameConfig>) {
  const conf = merge(cloneDeep(defaultGameConfig), config)
  const newNode: NodeState = { s: NodeEnum.OPEN }
  const sizeArr = [...Array(conf.size ** 2).keys()]

  //TODO: in true recursive fashion, this is depth=2... how to go deeper?
  return {
    ...newNode,
    ...sizeArr.map(() => ({
      ...newNode,
      ...sizeArr.map(() => newNode)
    }))
  } as NodeState
}

const isTaken = ({ s }: NodeState) => s === NodeEnum.DRAW || typeof s === 'number'
const isOpen = ({ s }: NodeState) => s === NodeEnum.OPEN
const isLocked = ({ s }: NodeState) => s === NodeEnum.LOCKED || isTaken({ s })
const getTaker = ({ s }: NodeState) => isTaken({ s }) ? s : null

/** Trying to make all state API style so easier to modify how it works in the future without rewriting UI/server code */
export default {
  isOpen, isTaken, isLocked, getTaker, createBoard, NodeEnum
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