import React, { useCallback, useContext } from 'react'
import tw, { css, styled } from 'twin.macro'

import { metaCoord } from 'metattt-common'
import { RoomContext } from '../providers/RoomProvider'
import { isEqual, cloneDeep } from 'lodash'

export const Grid = styled.div`
	${tw`grid place-content-stretch`}
	${({ size }: { size: number }) => css`
		grid-template-rows: repeat(${size}, minmax(0, 1fr));
		grid-template-columns: repeat(${size}, minmax(0, 1fr));
	`}
`

export interface SquareProps {
	/** coord of square on metaBoard */
	coord: metaCoord
	/** forces pid as winner instead of referring to state */
	winner?: string
}

export function Square({ coord, winner }: SquareProps) {
	const { room, dispatch, thisPlayer, getPlayerIcon } = useContext(RoomContext)
	const { state, currentPlayer } = room.game
	const [c1, c2] = coord

	const square = cloneDeep(state[c1]![c2]!)
	const isPrevious = isEqual(
		room.gameHistory[room.turn - 1]?.action.coord,
		coord,
	)
	const isDisabled = square.state !== 'open' || currentPlayer !== thisPlayer
	const pid = winner ?? square.winner

	const onClick = useCallback(() => {
		dispatch({
			action: 'place',
			move: {
				coord,
				player: thisPlayer,
			},
		})
	}, [dispatch, thisPlayer])

	return (
		<button
			tw='bg-white disabled:cursor-default focus:outline-none hover:bg-gray-200'
			css={[pid && tw`z-10`, isPrevious && tw`hidden`]}
			onMouseDown={onClick}
			disabled={isDisabled}
		>
			{pid && getPlayerIcon(pid)}
		</button>
	)
}

export interface BoardProps {
	/** which board on the metaBoard */
	coord: number
}

export function Board({ coord: c1 }: BoardProps) {
	const { room, thisPlayer } = useContext(RoomContext)
	const { state, currentPlayer, sizeArr, config } = room.game

	const board = state[c1]!
	const winner = board.winner ? board.winner : undefined
	const isDisabled = board.state !== 'open' || currentPlayer !== thisPlayer

	return (
		<Grid size={config.size} tw='relative gap-0.5'>
			{sizeArr.map((c2) => (
				<Square coord={[c1, c2]} winner={winner} key={c2}></Square>
			))}
			{
				<div
					tw='absolute inset-0 bg-black opacity-0 pointer-events-none transition-opacity'
					css={isDisabled && tw`pointer-events-auto opacity-40`}
				></div>
			}
		</Grid>
	)
}

/** needs RoomProvider */
export default function MetaBoard() {
	const { room } = useContext(RoomContext)
	const { config, sizeArr } = room.game

	return (
		<Grid size={config.size} tw='height[30rem] width[30rem] gap-1 bg-black p-1'>
			{sizeArr.map((c1) => (
				<Board coord={c1} key={c1}></Board>
			))}
		</Grid>
	)
}

/*
TODO:
- getPlayerColor separate from getPlayerIcon
- use above to add MetaBoard colour shadow
- mark out last move using border or smth
- recreate the rest of metaTTT graphically
*/
