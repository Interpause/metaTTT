/**
 * State represent a single instant
 * Player actions transform state to next state
 * A Game refers to the timeline of these states
 * After all, changes between state cant be in state itself
 * It must be stored externally
 * 
 * Layers-wise
 * BoardState -> GameState -> RoomState
 * GameEngine applies actions to BoardState, emits Turns
 * Turns stored as GameHistory in GameState
 * RoomReducer applies actions to GameState (like reset/new game/change config)
 * RoomState tracks that as RoomHistory
 */

import { defaultGameConfig, GameConfig } from './config'

/** string for player (userId), null for empty, false for draw (not applicable to squares) (trick used where both null & false are falsy) */
export type winner = string | null | false

/** one space on the board */
export interface SquareState {
	winner: winner
	/** states the metaBoard/board/square can be in */
	state: 'open' | 'occupied' | 'locked'
}

/** board is made of squares */
export interface BoardState extends SquareState {
	/** square 1D coord on board */
	[coord: number]: SquareState // SquareState | Board recursion works if wanted.
}

/** representation of metaTTT game state */
export interface MetaBoardState extends BoardState {
	/** current unlocked board */
	currentBoard: number | null
	/** board 1D coord on metaBoard */
	[coord: number]: BoardState
	/** game config */
	config: GameConfig
}

export function createBoard(options?: { config?: GameConfig }): MetaBoardState {
	const { config = defaultGameConfig } = options ?? {}
	const newSquare: SquareState = {
		winner: null,
		state: 'open',
	}

	const sizeArr = [...Array(config.size ** 2).keys()]

	return {
		config,
		currentBoard: null,
		...newSquare,
		...sizeArr.map(() => ({
			...newSquare,
			...sizeArr.map(() => newSquare),
		})),
	}
}
