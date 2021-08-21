/**
 * MetaTTT game state
 * MetaBoard > Board > Squares
 */
import { enablePatches, applyPatches, Patch, produceWithPatches } from 'immer'
export type { Patch } from 'immer'

enablePatches()

export interface GameConfig {
	/** length of side */
	size: number
	/** number of players */
	numPlayers: number
	/** coordinate transforms used in checking */
	checks: [number, number][]
	/** squares in a line required to win */
	numLineWin: number
}

export const defaultGameConfig: Readonly<GameConfig> = {
	size: 3,
	numPlayers: 2,
	checks: [
		[1, 0], // horizontal
		[0, 1], // vertical
		[1, 1], // right diagonal
		[-1, 1], // left diagonal
	],
	numLineWin: 3,
}

/** first number is board coord, second is square coord (coords in 1D form) */
export type metaCoord = [number, number]
/** regular x, y coord on a specific board */
export type coord = [number, number]

export interface Move {
	/** coord of move */
	coord: metaCoord
	/** player (userId) that made the move */
	player: string
}

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

/** string for player (userId), null for empty, false for draw (not applicable to squares) (trick used where both null & false are falsy) */
type winner = string | null | false

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

export enum GameError {
	/** coord exceeds range of board */
	ILLEGAL_MOVE_COORD = 'ILLEGAL_MOVE_COORD',
	/** move placing in locked square */
	ILLEGAL_MOVE_LOCKED = 'ILLEGAL_MOVE_LOCKED',
	/** move placing in occupied square */
	ILLEGAL_MOVE_OCCUPIED = 'ILLEGAL_MOVE_OCCUPIED',
	/** move placed when not user's turn */
	ILLEGAL_MOVE_TURN = 'ILLEGAL_MOVE_TURN',
	/** tried to go to invalid turn when time travelling */
	TURN_OUT_OF_RANGE = 'TURN_OUT_OF_RANGE',
}

/** Seeing as React likes immutability more, I am starting to wonder if I should convert GameState back to entity-component like rather than a class */
export class Game {
	/** game state, should be treated as if readonly externally */
	state: MetaBoardState

	/** config of this game */
	get config() {
		return this.state.config
	}

	/** array of 0 to size**2, useful for iterating */
	sizeArr: number[]

	/** current turn */
	turn: number

	/** total turns based on history */
	get totalTurns() {
		return this.history.length
	}

	get currentPlayer() {
		return this.players[this.turn % this.players.length]
	}

	get winner() {
		return this.state.winner
	}

	/** history of board moves */
	history: Turn[]

	players: string[]

	constructor(props: {
		players: string[]
		state?: MetaBoardState
		config?: GameConfig
		history?: Turn[]
	}) {
		// must be done first since this.config is a getter
		this.state =
			props.state ?? createBoard({ config: props.config ?? defaultGameConfig })
		this.players = props.players
		this.history = props.history ?? []
		this.turn = props.history?.length ?? 0
		this.sizeArr = [...Array(this.config.size ** 2).keys()]
	}

	/** follows rules when updating board state recursively */
	changeBoardState(
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

	/** allows time travel. return Patch[] to allow server to propagate changes to client */
	gotoTurn(turn: number) {
		if (turn < 0 || turn > this.totalTurns) throw GameError.TURN_OUT_OF_RANGE
		const isUndo = turn < this.turn
		let patches = Array<Patch>()
		if (isUndo) {
			const toUndo = this.history.slice(turn, this.turn).reverse()
			patches = patches.concat(...toUndo.map((t) => t.inverseChanges))
		} else {
			const toRedo = this.history.slice(this.turn, turn)
			patches = patches.concat(...toRedo.map((t) => t.changes))
		}
		this.applyPatches(patches)
		this.turn = turn
		return patches
	}

	/** used to apply patches sent from the server to client */
	applyPatches(patches: Patch[]) {
		this.state = applyPatches(this.state, patches)
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
			this.state,
			(draft) => {
				const square = draft[c1]![c2]!
				const nextBoard = draft[c2]!

				// actually place move
				square.winner = player
				square.state = 'occupied'

				// update wins
				const boardWinner = this.check(nextBoard)
				if (boardWinner !== null) {
					nextBoard.winner = boardWinner
					this.changeBoardState(nextBoard, 'occupied')

					if (nextBoard.winner) {
						const metaWinner = this.check(draft)
						if (metaWinner !== null) {
							draft.winner = metaWinner
							this.changeBoardState(draft, 'occupied')
						}
					}
				}

				// update which board is unlocked
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
		this.state = nextState as MetaBoardState

		// push the move into history, splicing out the future if redo-ing from past
		this.history.splice(this.turn, this.totalTurns, {
			action: move,
			turn: this.turn,
			changes: patches,
			inverseChanges: inversePatches,
		})
		this.turn = this.totalTurns

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

				for (let i = 0; i < this.config.numLineWin; i++) {
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

	validate(move: Move) {
		const {
			coord: [c1, c2],
			player,
		} = move
		const square = this.state[c1]![c2]!
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
