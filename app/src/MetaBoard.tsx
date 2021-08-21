import React, { useCallback, useContext } from 'react'
import tw, { css, styled } from 'twin.macro'

import { metaCoord } from 'metattt-common'
import { RoomContext } from './RoomProvider'

export interface SquareProps {
	/** coord of square on metaBoard */
	coord: metaCoord
	/** forces pid as winner instead of referring to state */
	winner?: string
}

export function Square({ coord, winner }: SquareProps) {
	const [c1, c2] = coord
	const { room, dispatch, thisPlayer, getPlayerIcon } = useContext(RoomContext)
	const { state, currentPlayer } = room.game

	const square = state[c1]![c2]!
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
			tw='bg-white disabled:cursor-default'
			css={pid && tw`z-10`}
			onClick={onClick}
			disabled={isDisabled}
		>
			{pid && getPlayerIcon(pid)}
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
	const { room, thisPlayer } = useContext(RoomContext)
	const { state, currentPlayer, sizeArr } = room.game
	const board = state[c1]!
	const winner = board.winner ? board.winner : undefined
	const isDisabled = board.state !== 'open' || currentPlayer !== thisPlayer

	return (
		<Grid size={state.config.size} tw='relative gap-0.5'>
			{sizeArr.map((c2) => (
				<Square coord={[c1, c2]} winner={winner} key={c2}></Square>
			))}
			{isDisabled && <div tw='absolute inset-0 bg-black opacity-40'></div>}
		</Grid>
	)
}

export default function MetaBoard() {
	const { room } = useContext(RoomContext)
	const game = room.game
	return (
		<Grid
			size={game.config.size}
			tw='height[30rem] width[30rem] gap-1 bg-black p-1'
		>
			{game.sizeArr.map((c1) => (
				<Board coord={c1} key={c1}></Board>
			))}
		</Grid>
	)
}
