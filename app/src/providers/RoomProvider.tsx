import React, {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useCallback,
	useLayoutEffect,
	useReducer,
	useState,
} from 'react'
import { defaultRoomConfig, Room, RoomConfig, RoomSave } from 'metattt-common'
import { createInitialState, roomAction, roomReducer } from './roomReducer'
import { useStorage } from './StorageProvider'
import { DefaultPlayerIcon } from '../components/PlayerIcon'

export const RoomContext = createContext({} as RoomContextData)

export interface RoomContextData {
	/** current room */
	room: Room
	/** dispatch actions to room */
	dispatch: Dispatch<roomAction> // roomAction extend roomAction?

	/** player using the board. constant in online game, rotates between players in local game */
	thisPlayer: string
	setThisPlayer: Dispatch<SetStateAction<string>>

	getPlayerIcon: (pid: string) => JSX.Element
}

export const defaultLocalConfig: Readonly<RoomConfig> = {
	...defaultRoomConfig,
	isOnline: false,
	players: [...Array(defaultRoomConfig.maxPlayers).keys()].map((i) => `p${i}`),
}

export function RoomProvider({ children }: { children: ReactNode }) {
	const [save, setSave] = useStorage<Partial<RoomSave>>('savefile', {
		config: defaultLocalConfig,
	})
	// start off with saved local room
	const [[room], dispatch] = useReducer(roomReducer, createInitialState(save))
	const game = room.game

	const [thisPlayer, setThisPlayer] = useState(game.players[0]!)

	// run only if local room
	useLayoutEffect(() => {
		if (room.isOnline) return
		setThisPlayer(game.currentPlayer!)
		setSave(room.getSave()) // save locally every turn
	}, [game.turn])

	useLayoutEffect(() => {
		;(globalThis as any).Room = room
	})

	const getPlayerIcon = useCallback((pid: string) => {
		return (
			{
				p0: <DefaultPlayerIcon color='red' />,
				p1: <DefaultPlayerIcon color='blue' />,
			}[pid] ?? <DefaultPlayerIcon color='black' />
		)
	}, [])

	return (
		<RoomContext.Provider
			value={{
				room,
				dispatch,
				thisPlayer,
				setThisPlayer,
				getPlayerIcon,
			}}
		>
			{children}
		</RoomContext.Provider>
	)
}
