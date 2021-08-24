/**
 * MetaTTT game state
 * MetaBoard > Board > Squares
 */
import { enablePatches, applyPatches, Patch, produceWithPatches } from 'immer'
export type { Patch } from 'immer'

import { GameConfig, defaultGameConfig } from './config'
import { GameError } from './enums'
import {
	MetaBoardState,
	createBoard,
	SquareState,
	BoardState,
	winner,
} from './state'

enablePatches()

/** first number is board coord, second is square coord (coords in 1D form) */
export type metaCoord = [number, number]
/** regular x, y coord on a specific board */
export type coord = [number, number]

/** represents the action of picking a square to place in */
export interface Move {
	/** coord of move */
	coord: metaCoord
	/** player (userId) that made the move */
	player: string
}

/** a game turn */
export interface Turn {
	/** there might be other action kinds eventually */
	action: Move
	/** turn number */
	turn: number
	/** changes */
	changes: Patch[]
	/** inverse changes */
	inverseChanges: Patch[]
}

/** the important parts that need to be saved when saving a Game */
export interface GameSave {
	players: string[]
	state: MetaBoardState
	config: GameConfig
	history: Turn[]
	/** used internally to sync past state to present */
	tempTurn?: number
}

/** adds a bunch of functionality a Game conceptually needs besides its state */
export class Game {
	/** internal game state */
	protected _state: MetaBoardState
	/** Game state, supposed to be a clone but performance */
	get state() {
		return this._state
	}

	/** config of this game */
	get config() {
		return this._state.config
	}

	/** readonly array of 0 to size**2, useful for iterating */
	sizeArr: readonly number[]

	/** the current turn */
	get turn() {
		return this._turn
	}
	protected _turn: number

	/** total turns based on history */
	get totalTurns() {
		return this._history.length
	}

	/** the current turn's player */
	get currentPlayer() {
		return this.players[this._turn % this.players.length]
	}

	/** number of players in the game */
	get numPlayers() {
		return this.players.length
	}

	/** game winner, false if draw, null if no winner yet */
	get winner() {
		return this._state.winner
	}

	/** history of board moves */
	get history() {
		return this._history
	}
	protected _history: Turn[]

	/** yes, you can freely set the players */
	public players: string[]

	/** recreates the Game from an optional GameSave or parts of it */
	constructor(initialState?: Partial<GameSave>) {
		const {
			players = [],
			history = [],
			config = defaultGameConfig,
			state,
			tempTurn,
		} = initialState ?? {}
    console.log('initiating...')
		this._state = state ?? createBoard({ config })
		this.players = players
		this._history = history
		this._turn = tempTurn ?? history.length
		this.sizeArr = Object.freeze([...Array(config.size ** 2).keys()])
		if (tempTurn !== undefined) this.gotoTurn(history.length)
	}

	/** get what is needed to save game */
	getSave(): GameSave {
		return {
			players: this.players,
			state: this._state,
			config: this.config,
			history: this._history,
			tempTurn: this._turn !== this.totalTurns ? this._turn : undefined,
		}
	}

	/** get index of player, used to calculate player color */
	getPlayerIndex(player: string) {
		return this.players.indexOf(player)
	}

	/** follows rules when updating board state recursively */
	protected changeBoardState(
		board: SquareState | BoardState,
		newState: 'open' | 'occupied' | 'locked',
	) {
		if (board.state !== 'occupied') board.state = newState

		//check if Square or Board
		if ((board as BoardState)[0]) {
			this.sizeArr.forEach((n) =>
				this.changeBoardState((board as BoardState)[n]!, newState),
			)
		}
	}

	/** allows time travel. return Patch[] to allow server to propagate changes to client TODO: redo/undo is funky when changing future from past, why? maybe room/game turns are desynced due to some sort of copy? */
	gotoTurn(turn: number) {
		console.log(
			`target: ${turn}, current: ${this._turn}, total: ${this.totalTurns}`,
		)
		if (turn < 0 || turn > this.totalTurns) throw GameError.TURN_OUT_OF_RANGE
		const isUndo = turn < this._turn
		let patches = Array<Patch>()
		if (isUndo) {
			const toUndo = this._history.slice(turn, this._turn).reverse()
			patches = patches.concat(...toUndo.map((t) => t.inverseChanges))
		} else {
			const toRedo = this._history.slice(this._turn, turn)
			patches = patches.concat(...toRedo.map((t) => t.changes))
		}
		this.applyPatches(patches)
		this._turn = turn
		return patches
	}

	/** used to apply patches sent from the server to client */
	applyPatches(patches: Patch[]) {
		this._state = applyPatches(this._state, patches)
	}

	/** places a move on the board. returns Patch[] for allowing server to propagate changes to client */
	place(move: Move) {
		const {
			coord: [c1, c2],
			player,
		} = move
		// first validate the move
		this.validate(move)

		// update function
		const [nextState, patches, inversePatches] = produceWithPatches(
			this._state,
			(draft) => {
				const board = draft[c1]!
				const square = board[c2]!

				// actually place move
				square.winner = player
				square.state = 'occupied'

				// update wins
				const boardWinner = this.check(board)
				if (boardWinner !== null) {
					board.winner = boardWinner // could be false if draw
					this.changeBoardState(board, 'occupied')

					if (board.winner) {
						const metaWinner = this.check(draft)
						if (metaWinner !== null) {
							draft.winner = metaWinner
							this.changeBoardState(draft, 'occupied')
						}
					}
				}

				// update which board is unlocked
				const nextBoard = draft[c2]!
				if (nextBoard.state === 'occupied') {
					draft.currentBoard = null
					this.changeBoardState(draft, 'open')
				} else {
					draft.currentBoard = c2
					this.changeBoardState(draft, 'locked')
					this.changeBoardState(nextBoard, 'open')
				}
			},
		)
		this._state = nextState as MetaBoardState

		// push the move into history, splicing out the future if redo-ing from past
		this._history.splice(this._turn, this.totalTurns, {
			action: move,
			turn: this._turn,
			changes: patches,
			inverseChanges: inversePatches,
		})
		this._turn = this.totalTurns

		return patches
	}

	/** checks for who won the board */
	check(board: BoardState): winner {
		let isFull = true
		for (let n of this.sizeArr) {
			const square = board[n]! // current square examined
			if (isFull && square.state !== 'occupied') isFull = false
			if (!square.winner) continue // if not player, skip square

			// Array.every is true if all elements are true: true returned when not won
			const isWin = !this.config.checks.every(([dx, dy]) => {
				let [x, y] = this.o2D(n) // 2D coord of current square

				for (let i = 1; i < this.config.numLineWin; i++) {
					// 1D coord of square in line being checked
					const coord = this.t1D([(x += dx), (y += dy)])
					if (x < 0 || y < 0 || x >= this.config.size || y >= this.config.size)
						return true
					if (board[coord]!.winner !== square.winner) return true
				}

				return false
			})
			if (isWin) return square.winner
		}
		if (isFull) return false
		else return null
	}

	/** throws a lot of different kinds of errors if move isn't valid */
	validate(move: Move) {
		const {
			coord: [c1, c2],
			player,
		} = move
		const square = this._state[c1]![c2]!
		if (square.state === 'locked') throw GameError.ILLEGAL_MOVE_LOCKED
		if (square.state === 'occupied') throw GameError.ILLEGAL_MOVE_OCCUPIED
		if (player !== this.currentPlayer) throw GameError.ILLEGAL_MOVE_TURN
		if (
			c1 < 0 ||
			c2 < 0 ||
			c1 >= this.config.size ** 2 ||
			c2 >= this.config.size ** 2
		)
			throw GameError.ILLEGAL_MOVE_COORD
	}

	/** converts 1D coord to 2D ([x,y]) */
	o2D = (coord1D: number) =>
		[coord1D % this.config.size, ~~(coord1D / this.config.size)] as coord

	/** converts 2D coord ([x,y]) to 1D */
	t1D = ([x, y]: coord) => y * this.config.size + x
}
