import React, {
	createContext,
	Dispatch,
	ProviderProps,
	useCallback,
	useLayoutEffect,
	useReducer,
} from 'react'
import { defaultRoomConfig, Room, RoomConfig, RoomSave } from 'metattt-common'
import { createInitialState, roomReducer, roomAction } from './roomReducer'
import { createKey } from './StorageProvider'
import { BasePlayerIcon } from '../components/PlayerIcon'

export const defaultLocalConfig: Readonly<RoomConfig> = {
	...defaultRoomConfig,
	isOnline: false,
	players: [...Array(defaultRoomConfig.maxPlayers).keys()].map((i) => `p${i}`),
}

export interface RoomContextData {
	/** current room */
	room: Room
	/** player using the board. constant in online game, rotates between players in local game */
	thisPlayer: string
	/** dispatch actions to room */
	dispatch: Dispatch<roomAction> // roomAction extend roomAction?

	getPlayerIcon: (pid: string) => JSX.Element
}

export const RoomContext = createContext<RoomContextData>({} as RoomContextData)

const [SaveProvider, useSave] = createKey<Partial<RoomSave>>('savefile', {
	config: defaultLocalConfig,
})

function RoomProviderInternal(
	props: Omit<ProviderProps<RoomContextData>, 'value'>,
) {
	// initialSave won't be updated
	const [initialSave, , setSaveSilent] = useSave()
	// start off with saved local room
	const [{ room, thisPlayer }, dispatch] = useReducer(
		roomReducer,
		undefined,
		// createInitialState wasn't memo-ed & being called on rerenders
		// lazy init fixed this, TODO: check if this fixes wonky timeline
		() => createInitialState(initialSave!),
	)

	useLayoutEffect(() => {
		//TODO: save recent games goes somewhere here
		if (room.isOnline) return
		// initialSave isn't updated
		if (room.winner !== null)
			setSaveSilent({
				config: defaultLocalConfig,
			})
		else setSaveSilent(room.getSave())
	}, [room.turn])

	const getPlayerIcon = useCallback(
		(pid: string) => <BasePlayerIcon color={room.getPlayerColor(pid)} />,
		[],
	)

	return (
		<RoomContext.Provider
			value={{
				room,
				dispatch,
				thisPlayer,
				getPlayerIcon,
			}}
			{...props}
		/>
	)
}

export function RoomProvider(
	props: Omit<ProviderProps<RoomContextData>, 'value'>,
) {
	return (
		<SaveProvider>
			<RoomProviderInternal {...props} />
		</SaveProvider>
	)
}
