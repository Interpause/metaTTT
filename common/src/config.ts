export interface GameConfig {
	/** length of side */
	size: number
	/** coordinate transforms used in checking */
	checks: [number, number][]
	/** squares in a line required to win */
	numLineWin: number
}

export const defaultGameConfig: Readonly<GameConfig> = {
	size: 3,
	checks: [
		[1, 0], // horizontal
		[0, 1], // vertical
		[1, 1], // right diagonal
		[-1, 1], // left diagonal
	],
	numLineWin: 3,
}

export interface RoomConfig {
	/** max number of players */
	maxPlayers: number
	/** players in the room */
	players: string[]
	/** whether its a local or online room */
	isOnline: boolean
	/** game config */
	gameConfig: GameConfig
}

export const defaultRoomConfig: Readonly<RoomConfig> = {
	maxPlayers: 2,
	players: [],
	isOnline: true,
	gameConfig: defaultGameConfig, // changing has no effect after new Game()
}
