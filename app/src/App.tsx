import tw, { css, GlobalStyles } from 'twin.macro'

import React, { useEffect, useState } from 'react'

import MetaBoard from './Board'

function HelloWorld() {
	const [state, setState] = useState(true)
	const [text, setText] = useState('')
	useEffect(() => {
		;(async () => {
			await new Promise((callback) => setTimeout(callback, 5000))
			const test = Math.random() > 0.5 ? undefined : true
			console.log(test ?? 'UWU')
			console.log(navigator.appVersion)
			setText(navigator.appVersion)
		})()
	}, [])
	return (
		<>
			<h1 css={!state && tw`opacity-0`} tw='text-blue-500 font-bold text-2xl'>
				Hello world!
			</h1>
			<button onClick={() => setState(!state)}>{state ? 'On' : 'Off'}</button>
			<h3>{text}</h3>
		</>
	)
}

export default function App() {
	return (
		<>
			<GlobalStyles />
			<HelloWorld />
			<MetaBoard />
		</>
	)
}
