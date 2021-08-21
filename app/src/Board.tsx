import tw, { css, styled, GlobalStyles } from 'twin.macro'
import { Game, metaCoord, Move, Patch } from 'metattt-common'

import React, {
	createContext,
	Dispatch,
	useCallback,
	useContext,
	useReducer,
} from 'react'

export type localPlayer = `localplayer-${number}`

export interface GameContextData {
	/** current game being played/displayed */
	state: Game
	/** dispatch actions to game */
	dispatch: Dispatch<gameAction>
	/** player using the board. constant in online game, rotates between players in local game  */
	boardPlayer: string | localPlayer
}

export const GameContext = createContext({} as GameContextData)

export type gameAction =
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

/** as Game mutates inplace, entire thing must be wrapped in reducer to "play nice" with React rerenders */
export function gameReducer([state, x]: [Game, number], action: gameAction) {
	try {
		switch (action.action) {
			case 'place':
				state.place(action.move)
				break
			case 'gotoTurn':
				state.gotoTurn(action.turn)
				break
			case 'applyPatches':
				state.applyPatches(action.patches)
				break
		}
	} catch (e) {
		console.warn('gameReducer error:', e, action)
	}
	return [state, x + 1] as [Game, number]
}

export interface SquareProps {
	/** coord of square on metaBoard */
	coord: metaCoord
}

export function Square({ coord }: SquareProps) {
	const [c1, c2] = coord
	const { state, dispatch, boardPlayer } = useContext(GameContext)
	const square = state.state[c1]![c2]!
	const isDisabled =
		square.state !== 'open' || state.currentPlayer !== boardPlayer
	const onClick = useCallback(() => {
		console.log(square)
		dispatch({
			action: 'place',
			move: {
				coord,
				player: boardPlayer,
			},
		})
	}, [dispatch, boardPlayer])
	return (
		<button
			tw='bg-white disabled:cursor-default'
			onClick={onClick}
			disabled={isDisabled}
		>
			{square.winner?.toString()}
		</button>
	)
}

export const Grid = styled.div`
	${tw`grid place-content-stretch`}
	${({ size }: { size: number }) => css`
		grid-template-rows: repeat(${size}, minmax(0, 1fr));
		grid-template-columns: repeat(${size}, minmax(0, 1fr));
	`}
`

export interface BoardProps {
	/** which board on the metaBoard */
	coord: number
}

export function Board({ coord: c1 }: BoardProps) {
	const { state, boardPlayer } = useContext(GameContext)
	const board = state.state[c1]!
	const isDisabled =
		board.state !== 'open' || state.currentPlayer !== boardPlayer

	return (
		<Grid size={state.config.size} tw='gap-0.5'>
			{state.sizeArr.map((c2) => (
				<Square coord={[c1, c2]} key={c2}></Square>
			))}
			{isDisabled && <div tw='bg-black opacity-40 h-full w-full'></div>}
		</Grid>
	)
}

export interface MetaBoardProps {
	initialState?: Game
}

export default function MetaBoard({ initialState }: MetaBoardProps) {
	// without rewriting Game to be immutable, https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
	const [[state], dispatch] = useReducer(gameReducer, [
		initialState ??
			new Game({
				players: ['localplayer-0', 'localplayer-1'],
			}),
		0,
	])
	return (
		<GameContext.Provider
			value={{ state, dispatch, boardPlayer: 'localplayer-0' }}
		>
			<Grid
				size={state.config.size}
				tw='height[30rem] width[30rem] gap-1 bg-black p-1'
			>
				{state.sizeArr.map((c1) => (
					<Board coord={c1} key={c1}></Board>
				))}
			</Grid>
		</GameContext.Provider>
	)
}
