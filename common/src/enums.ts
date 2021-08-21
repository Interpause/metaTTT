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

export enum RoomError {
	/** room already started the game */
	ROOM_ALREADY_STARTED = 'ROOM_ALREADY_STARTED',
	/** room is already full */
	ROOM_ALREADY_FULL = 'ROOM_ALREADY_FULL',
	/** not enough players */
	ROOM_NOT_FULL = 'ROOM_NOT_FULL',
}
