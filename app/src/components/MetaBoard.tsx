import { isEqual } from 'lodash'
import React, {
	ComponentPropsWithRef,
	useContext,
	memo,
	createRef,
	useMemo,
	RefObject,
	useState,
	useLayoutEffect,
	SetStateAction,
	Dispatch,
} from 'react'
import tw, { css, styled } from 'twin.macro'
import { BoardState, metaCoord } from 'metattt-common'
import { RoomContext } from '../providers/RoomProvider'

export const Grid = styled.div`
	${tw`grid place-content-stretch`}
	${({ size }: { size: number }) => css`
		grid-template-rows: repeat(${size}, minmax(0, 1fr));
		grid-template-columns: repeat(${size}, minmax(0, 1fr));
	`}
`

export const DisabledOverlay = styled.div`
	${tw`absolute inset-0 bg-black opacity-0 pointer-events-none transition-opacity`}
	${({ disabled }: { disabled?: boolean }) =>
		disabled && tw`pointer-events-auto opacity-40`}
`

export const Square = styled.button`
	${tw`bg-white focus:outline-none hover:bg-gray-200`}
	&[data-filled] {
		${tw`z-10`}
	}
	&[data-previous] {
		${tw`ring-1 ring-offset-1 ring-yellow-200 ring-offset-black z-20`}
	}
`

export interface BoardProps {
	board: BoardState
	c1: number
	sizeArr: readonly number[]
	size: number
	forwardedRefs: RefObject<HTMLButtonElement>[]
	getPlayerIcon: (pid: string) => JSX.Element
	setClicked: Dispatch<SetStateAction<metaCoord | undefined>>
}
function BoardInternal({
	board,
	c1,
	sizeArr,
	size,
	forwardedRefs,
	setClicked,
	getPlayerIcon,
}: BoardProps) {
	const boardWinner = board.winner ? board.winner : undefined
	return (
		<Grid size={size} tw='relative gap-0.5'>
			{sizeArr.map((c2) => {
				const square = board[c2]!
				const squareWinner =
					boardWinner ?? (square.winner ? square.winner : undefined)

				return (
					<Square
						ref={forwardedRefs[c2]!}
						key={c2}
						onMouseDown={() => setClicked([c1, c2])}
						disabled={square.state !== 'open'}
						data-filled={square.state === 'occupied' ? '' : undefined}
					>
						{squareWinner && getPlayerIcon(squareWinner)}
					</Square>
				)
			})}

			<DisabledOverlay disabled={board.state !== 'open'} />
		</Grid>
	)
}
const Board = memo(BoardInternal, (p, n) => isEqual(p.board, n.board))

export function MetaBoard(props: Partial<ComponentPropsWithRef<typeof Grid>>) {
	const [coordClicked, setClicked] = useState<metaCoord>()
	const { room, thisPlayer, getPlayerIcon, dispatch } = useContext(RoomContext)
	const { game, currentPlayer, prevTurn, getPlayerColor, turn } = room
	const { state, config, sizeArr } = game
	const { size } = config
	const prevCoord = prevTurn?.action.coord

	// yup we doing this in order to highlight the previous move without rerendering EVERYTHING
	const gridRef = useMemo(
		() => sizeArr.map(() => sizeArr.map(() => createRef<HTMLButtonElement>())),
		[sizeArr],
	)

	useLayoutEffect(() => {
		if (!coordClicked) return
		dispatch({
			action: 'place',
			move: {
				coord: coordClicked,
				player: thisPlayer,
			},
		})
		setClicked(undefined)
	})

	useLayoutEffect(() => {
		if (!prevCoord) return
		const [c1, c2] = prevCoord
		const button = gridRef[c1]![c2]!.current
		if (!button) return
		button.setAttribute('data-previous', '')
		return () => button.removeAttribute('data-previous')
	}, [turn])

	return (
		<Grid
			{...props}
			size={size}
			tw='relative gap-1 bg-black p-1 height[30rem] width[30rem]'
		>
			{sizeArr.map((c1) => (
				<Board
					board={state[c1]!}
					forwardedRefs={gridRef[c1]!}
					c1={c1}
					key={c1}
					sizeArr={sizeArr}
					size={size}
					setClicked={setClicked}
					getPlayerIcon={getPlayerIcon}
				/>
			))}
			<DisabledOverlay disabled={currentPlayer !== thisPlayer} />
		</Grid>
	)
}
