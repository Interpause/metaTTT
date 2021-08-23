import 'twin.macro'
import React from 'react'
import { Route, Link } from 'wouter'

import { RoomProvider } from './providers/RoomProvider'
import { IsogridBackground } from './components/IsogridBackground'

import Home from './pages/Home'

export default function App() {
	return (
		<div tw='absolute inset-0 overflow-hidden'>
			<IsogridBackground
				tw='absolute inset-0 overflow-hidden bg-yellow-500 z-index[-10]'
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
