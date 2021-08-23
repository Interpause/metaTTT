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
import { BoardState, metaCoord, winner } from 'metattt-common'
import { RoomContext } from '../providers/RoomProvider'

export const Grid = styled.div`
	${tw`grid place-content-stretch`}
	${({ size }: { size: number }) => css`
		grid-template-rows: repeat(${size}, minmax(0, 1fr));
		grid-template-columns: repeat(${size}, minmax(0, 1fr));
	`}
`

export const DisabledOverlay = styled.div`
	${tw`absolute inset-0 bg-black opacity-0 pointer-events-none transition-opacity duration-300`}
	${({ disabled }: { disabled?: boolean }) =>
		disabled && tw`pointer-events-auto opacity-40`}
`

export const Square = styled.button`
	${tw`bg-white focus:outline-none disabled:cursor-default enabled:hover:bg-gray-200`}
	&[data-filled] {
		${tw`z-10 transition-colors duration-500`}
	}
	&[data-previous] {
		${tw`ring-1 ring-offset-2 ring-yellow-200 ring-offset-black z-20 transition-none`}
	}
`

export interface BoardProps {
	/** coordinate of Board on Metaboard */
	c1: number
	/** board state */
	board: BoardState
	/** metaBoard winner if any */
	winner?: winner
	/** passed down for ease of iteration */
	sizeArr: readonly number[]
	/** size of board */
	size: number
	/** refs are forwarded to squares for highlight previous move */
	forwardedRefs: RefObject<HTMLButtonElement>[]
	/** function to get player icon put in square */
	getPlayerIcon: (pid: string) => JSX.Element
	/** get color for that player */
	getPlayerColor: (pid: string) => string
	/** used to inform metaBoard which square was clicked */
	setClicked: Dispatch<SetStateAction<metaCoord | undefined>>
}
function BoardInternal({
	board,
	winner,
	c1,
	sizeArr,
	size,
	forwardedRefs,
	setClicked,
	getPlayerIcon,
	getPlayerColor,
}: BoardProps) {
	// if metaBoard winner not null (none) or false (draw), use it
	const boardWinner = winner ? winner : board.winner ? board.winner : undefined
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
						css={
							squareWinner &&
							css`
								background-color: ${getPlayerColor(squareWinner)};
							`
						}
					>
						{squareWinner && getPlayerIcon(squareWinner)}
					</Square>
				)
			})}

			<DisabledOverlay disabled={board.state !== 'open'} />
		</Grid>
	)
}
const Board = memo(
	BoardInternal,
	(p, n) => isEqual(p.board, n.board) && p.winner === n.winner,
)

export function MetaBoard(props: Partial<ComponentPropsWithRef<typeof Grid>>) {
	const [coordClicked, setClicked] = useState<metaCoord>()
	const { room, thisPlayer, getPlayerIcon, dispatch } = useContext(RoomContext)
	const { game, currentPlayer, prevTurn, turn } = room
	const { state, config, sizeArr } = game
	const { size } = config
	const prevCoord = prevTurn?.action.coord
	const getPlayerColor = room.getPlayerColor.bind(room)

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
			tw='relative gap-1 bg-black p-1 transition-shadow duration-1000'
			css={css`
				box-shadow: 0 0 1rem 0.5rem ${getPlayerColor(currentPlayer!)};
			`}
		>
			{sizeArr.map((c1) => (
				<Board
					board={state[c1]!}
					forwardedRefs={gridRef[c1]!}
					c1={c1}
					key={c1}
					winner={game.winner}
					sizeArr={sizeArr}
					size={size}
					setClicked={setClicked}
					getPlayerIcon={getPlayerIcon}
					getPlayerColor={getPlayerColor}
				/>
			))}
			<DisabledOverlay disabled={currentPlayer !== thisPlayer} />
		</Grid>
	)
}
