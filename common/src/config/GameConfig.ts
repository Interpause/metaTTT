import { BoardConfig, defaultBoardConfig } from "./BoardConfig"

export interface GameConfig extends BoardConfig {
	/** coordinate transforms used in checking */
	checks: [number, number][]
	/** squares in a line required to win */
	numLineWin: number
	/** number of players */
	numPlayers: number
}

export const defaultGameConfig: Readonly<GameConfig> = {
	...defaultBoardConfig,
	checks: [
		[1, 0], // horizontal
		[0, 1], // vertical
		[1, 1], // right diagonal
		[-1, 1], // left diagonal
	],
	numLineWin: 3,
	numPlayers: 2
}
