import { defaultGameConfig, GameConfig } from "./GameConfig";

export interface RoomConfig extends GameConfig {
	/** players in the room */
	players: string[]
	/** whether its a local or online room */
	isOnline: boolean
}

export const defaultRoomConfig: Readonly<RoomConfig> = {
	...defaultGameConfig,
	players: [],
	isOnline: true,
}
