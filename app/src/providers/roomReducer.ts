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
	| {
			action: 'changeThisPlayer'
			player: string
	  }

export interface RoomReducerState {
	room: Room
	render: number
	thisPlayer: string
}

export function createInitialState(
	roomSave: Partial<RoomSave>,
): RoomReducerState {
	const room = new Room(roomSave)
	return {
		room,
		thisPlayer: room.currentPlayer!,
		render: 0,
	}
}

/** as Game mutates inplace, entire thing must be wrapped in reducer to "play nice" with React rerenders */
export function roomReducer(
	{ room, render, thisPlayer }: RoomReducerState,
	action: roomAction,
): RoomReducerState {
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

	if (!room.isOnline) thisPlayer = room.currentPlayer!

	return {
		room,
		thisPlayer,
		// without rewriting Game to be immutable, https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
		render: render + 1,
	}
}
