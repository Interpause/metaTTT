import 'twin.macro'

import React, { useContext } from 'react'
import {
	IoReloadSharp,
	IoGlobeOutline,
	IoPaperPlaneSharp,
	IoExtensionPuzzleSharp,
	IoStorefrontSharp,
	IoTimeSharp,
	IoSettingsSharp,
	IoStatsChartSharp,
} from 'react-icons/io5'

import { MetaBoard } from '../components/MetaBoard'
import { RoomContext } from '../providers/RoomProvider'
import { Button, ButtonBar } from '../components/Misc'

export default function Home() {
	const { dispatch } = useContext(RoomContext)
	const resetGame = () => {
		dispatch({
			action: 'restartGame',
		})
	}
	return (
		<>
			<ButtonBar tw='absolute top-0'>
				<Button disabled>
					<IoGlobeOutline />
					Online
				</Button>
				<Button disabled>
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
			<MetaBoard tw='absolute m-auto inset-0 width[calc(100vw - 1rem)] height[calc(100vw - 1rem)]' />

			<ButtonBar tw='absolute bottom-0'>
				<Button disabled>
					<IoSettingsSharp />
					Settings
				</Button>
				<Button disabled>
					<IoTimeSharp />
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
		</>
	)
}
