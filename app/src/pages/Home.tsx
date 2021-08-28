import 'twin.macro'

import React, { useContext, useEffect, useState } from 'react'
import {
	IoReloadSharp,
	IoGlobeOutline,
	IoPaperPlaneSharp,
	IoExtensionPuzzleSharp,
	IoStorefrontSharp,
	IoTimeSharp,
	IoSettingsSharp,
	IoStatsChartSharp,
	IoArrowRedoSharp,
	IoArrowUndoSharp,
} from 'react-icons/io5'

import { MetaBoard } from '../components/MetaBoard'
import { RoomContext } from '../providers/RoomProvider'
import { Button, ButtonBar } from '../components/Misc'
import { css } from 'twin.macro'
import { clamp } from 'lodash'

const resetSound = new Audio(require('../../assets/audio/reset.mp3'))
const winSound = new Audio(require('../../assets/audio/tada.mp3'))

function TurnControl() {
	const { dispatch, room } = useContext(RoomContext)
	//TODO: useCallback when callback is passed down or expensive to create, dont use it willy nilly
	//same with useMemo
	const setTurn = (t: number) => {
		dispatch({
			action: 'gotoTurn',
			turn: clamp(t, 0, room.totalTurns),
		})
	}

	return (
		<div tw='w-full text-center px-8'>
			<h4 tw='text-xl bg-white p-1 rounded inline-block'>{`Turn ${room.turn}/${room.totalTurns} Total`}</h4>
			<input
				tw='block w-full'
				type='range'
				value={room.turn}
				min={0}
				max={room.totalTurns}
				onChange={(e) => setTurn(parseInt(e.target.value))}
			/>
		</div>
	)
}

export default function Home() {
	const { dispatch, room } = useContext(RoomContext)
	const [inResetAnim, setInResetAnim] = useState(false)
	const [isTurnControlShown, setTurnControlShown] = useState(false)

	const resetGame = () => {
		setInResetAnim(true)
		dispatch({
			action: 'restartGame',
		})
	}

	const redoStep = () => {
		console.log('beep redo')
		dispatch({
			action: 'gotoTurn',
			turn: Math.min(room.turn + 1, room.totalTurns),
		})
	}

	const undoStep = () => {
		console.log('beep undo')
		dispatch({
			action: 'gotoTurn',
			turn: Math.max(room.turn - 1, 0),
		})
	}

	useEffect(() => {
		if (inResetAnim) {
			resetSound.play()
			const id = setTimeout(() => setInResetAnim(false), 1000)
			return () => clearTimeout(id)
		}
	}, [inResetAnim])

	useEffect(() => {
		if (room.winner) {
			winSound.play()
		}
	}, [room.winner])

	return (
		<>
			<header tw='absolute top-0 w-full'>
				<ButtonBar>
					<Button disabled>
						<IoGlobeOutline />
						Online
					</Button>
					<Button disabled>
						{/* TODO: https://capacitorjs.com/docs/v2/guides/deep-links */}
						<IoPaperPlaneSharp />
						Invite
					</Button>
					<Button disabled>
						<IoExtensionPuzzleSharp />
						Puzzles
					</Button>
					<Button disabled>
						<IoStorefrontSharp />
						Store
					</Button>
				</ButtonBar>
			</header>

			<MetaBoard
				tw='absolute m-auto inset-0 width[calc(100vw - 1rem)] height[calc(100vw - 1rem)]'
				css={
					inResetAnim &&
					css`
						animation: spin 1s ease 1;
					`
				}
			/>
			
			<footer tw='absolute bottom-0 w-full'>
				{isTurnControlShown && <TurnControl />}
				<ButtonBar>
					<Button disabled>
						<IoSettingsSharp />
						Settings
					</Button>
					<Button>
						<IoTimeSharp
							onClick={() => setTurnControlShown(!isTurnControlShown)}
						/>
						Timeline
					</Button>
					<Button disabled>
						<IoStatsChartSharp />
						History
					</Button>
					<Button onClick={resetGame}>
						<IoReloadSharp />
						Reset
					</Button>
				</ButtonBar>
			</footer>
		</>
	)
}
/*
<Button disabled>
	<IoTimeSharp />
	Timeline
</Button>
<Button disabled>
	<IoStatsChartSharp />
	History
</Button>
 */
