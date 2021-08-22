import { Move, Patch, Room, RoomSave } from 'metattt-common'

/** actions roomReducer accepts */
export type roomAction =
	| {
			action: 'place'
			move: Move
	  }
	| {
			action: 'gotoTurn'
			turn: number
	  }
	| {
			action: 'applyPatches'
			patches: Patch[]
	  }
	| {
			action: 'changeRoom'
			room: RoomSave
	  }
	| {
			action: 'restartGame'
	  }

export function createInitialState(
	roomSave: Partial<RoomSave>,
): [Room, number] {
	const room = new Room(roomSave)
	// without rewriting Game to be immutable, https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
	return [room, 0]
}

/** as Game mutates inplace, entire thing must be wrapped in reducer to "play nice" with React rerenders */
export function roomReducer(
	[room, x]: [Room, number],
	action: roomAction,
): [Room, number] {
	// TODO: very different logic if room is online
	try {
		switch (action.action) {
			case 'place':
				room.game.place(action.move)
				break
			case 'gotoTurn':
				room.game.gotoTurn(action.turn)
				break
			case 'applyPatches':
				room.game.applyPatches(action.patches)
				break
			case 'restartGame':
				room.restart()
				break
		}
	} catch (e) {
		console.warn('roomReducer error:', e, action)
	}
	return [room, x + 1]
}
