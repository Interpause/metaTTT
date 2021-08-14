import tw, { css, GlobalStyles } from 'twin.macro'

import React, { useState } from 'react'

function HelloWorld() {
	const [state, setState] = useState(true)
	return (
		<>
			<h1 css={!state && tw`opacity-0`} tw='text-blue-500 font-bold text-2xl'>
				Hello world!
			</h1>
			<button onClick={() => setState(!state)}>{state ? 'On' : 'Off'}</button>
		</>
	)
}

export default function App() {
	return (
		<>
			<GlobalStyles />
			<HelloWorld />
		</>
	)
}
