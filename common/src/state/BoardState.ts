/**
 * Yes, MetaTTT can be represented as a graph theory tree
 */

import { BoardConfig, defaultBoardConfig } from "../config/BoardConfig"

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
  /** the id of the child node, equivalent to its position */
  [N: number]: NodeState
}

/** creates an empty board using defaultGameConfig & config */
export function createBoard(config?: Partial<BoardConfig>) {
  const { size, depth } = { ...defaultBoardConfig, ...config }

  const rootNode: NodeState  = { s: NodeEnum.OPEN }
  const queue = [rootNode]

  for (let i = 0; i < depth; i++)
    for (let node of queue.splice(0, queue.length))
      for (let n = 0; n < size ** 2; n++)
        queue.push(node[n] = { s: NodeEnum.OPEN })

  return rootNode
}

/** returns functions for inspecting board state */
export const bUtil = {
  /** either the node is taken or is a draw */
  isFull: ({s}:NodeState) => s === NodeEnum.DRAW || typeof s === 'number',
  /** node is locked or otherwise full */
  isLocked: ({s}:NodeState) => s === NodeEnum.LOCKED || s === NodeEnum.DRAW || typeof s === 'number',
  /** returns player N that took the node else undefined */
  getTaker: ({s}:NodeState) => typeof s === 'number' ? s : undefined,
  /** return the child nodes else undefined if none */
  getChildren: ({s,...children}:NodeState) => {
    for(let _ in children) return children
  }
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