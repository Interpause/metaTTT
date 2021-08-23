import { Game, GameSave, Move } from './game'
import { RoomConfig, defaultRoomConfig } from './config'
import { GameError, RoomError } from './enums'

export interface RoomSave {
	gameSave: GameSave
	config: RoomConfig
}

export class Room {
	game: Game
	config: RoomConfig
	isStarted: boolean = false

	get players() {
		return [...this.game.players]
	}
	protected _spectators: string[]
	get spectators() {
		return [...this._spectators]
	}

	get numPlayers() {
		return this.game.numPlayers
	}

	get numSpectators() {
		return this._spectators.length
	}

	get maxPlayers() {
		return this.config.maxPlayers
	}

	get isOnline() {
		return this.config.isOnline
	}

	get turn() {
		return this.game.turn
	}

	get totalTurns() {
		return this.game.totalTurns
	}

	get currentPlayer() {
		return this.game.currentPlayer
	}

	get winner() {
		return this.game.winner
	}

	get gameHistory() {
		return this.game.history
	}

	get prevTurn() {
		return this.game.history[this.game.turn - 1] // even when timetravelling
	}

	get roomHistory() {
		return []
	}

	constructor(initialState?: Partial<RoomSave>) {
		const { gameSave, config = defaultRoomConfig } = initialState ?? {}
		this.game = new Game(gameSave ?? { config: config.gameConfig })
		this.config = config
		this.game.players = config.players // [] if default
		this._spectators = this.players
	}

	getSave(): RoomSave {
		return {
			gameSave: this.game.getSave(),
			config: this.config,
		}
	}

	addPlayer(pid: string) {
		if (this.isStarted) throw RoomError.ROOM_ALREADY_STARTED
		if (this.numPlayers === this.maxPlayers) throw RoomError.ROOM_ALREADY_FULL
		this.game.players.push(pid)
		this.addSpectator(pid)
	}

	removePlayer(pid: string) {
		throw 'will never be implemented'
	}

	addSpectator(pid: string) {
		this._spectators.push(pid)
	}

	removeSpectator(pid: string) {
		this._spectators = this._spectators.filter((i) => i !== pid)
	}

	place(pid: string, move: Move) {
		if (move.player !== pid) throw GameError.ILLEGAL_MOVE_TURN
		this.game.place(move)
	}

	getPlayerColor(pid: string) {
		const ind = this.game.getPlayerIndex(pid)
		if (ind === -1) throw RoomError.PLAYER_NOT_IN_ROOM
		return `hsl(${(ind * (360 / this.numPlayers)) % 360},100%,50%)`
	}

	start() {
		if (this.numPlayers !== this.maxPlayers) throw RoomError.ROOM_NOT_FULL
		if (this.isStarted) throw RoomError.ROOM_ALREADY_STARTED
		this.isStarted = true
	}

	restart() {
		this.game = new Game({
			config: this.config.gameConfig,
			players: this.players,
		})
		this.isStarted = false
	}
}
