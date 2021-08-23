import 'twin.macro'
import React, { useEffect } from 'react'
import { Route } from 'wouter'

import { RoomProvider } from './providers/RoomProvider'
import { IsogridBackground } from './components/IsogridBackground'

import Home from './pages/Home'

const bgMusic = new Audio(require('../assets/audio/IsoGrid Room.mp3'))

export default function App() {
	useEffect(() => {
		bgMusic.loop = true
		const id = setInterval(() => {
			bgMusic
				.play()
				.then(() => clearInterval(id))
				.catch(console.warn)
		}, 1000)
	}, [])

	//TODO: https://codesandbox.io/embed/wouter-animated-transitions-w-reactspring-bfruo

	return (
		<div tw='absolute inset-0 overflow-hidden'>
			<IsogridBackground
				tw='absolute inset-0 overflow-hidden bg-yellow-400 z-index[-10]'
				rows={4}
				cols={4}
			/>
			<RoomProvider>
				<Route path='/'>
					<Home />
				</Route>
			</RoomProvider>
		</div>
	)
}
