import tw from 'twin.macro'

import React, { useContext, useState } from 'react'

import MetaBoard from './MetaBoard'
import { RoomContext, RoomProvider } from './RoomProvider'

function HelloWorld() {
	const [state, setState] = useState(true)
	const { dispatch } = useContext(RoomContext)
	const resetGame = () => {
		dispatch({
			action: 'restartGame',
		})
	}
	return (
		<>
			<h1 css={!state && tw`opacity-0`} tw='text-blue-500 font-bold text-2xl'>
				Hello world!
			</h1>
			<button onClick={() => setState(!state)}>{state ? 'On' : 'Off'}</button>
			<MetaBoard />
			<button onClick={resetGame}>Reset</button>
		</>
	)
}

export default function App() {
	return (
		<>
			<RoomProvider>
				<HelloWorld />
			</RoomProvider>
		</>
	)
}
