import tw from 'twin.macro'

import React, { useContext, useState } from 'react'

import { MetaBoard } from '../components/MetaBoard'
import { RoomContext } from '../providers/RoomProvider'

export default function Home() {
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
			<MetaBoard tw='width[90vw] height[90vw] lg:(width[30rem] height[30rem])' />

			<button onClick={resetGame}>Reset</button>
		</>
	)
}
