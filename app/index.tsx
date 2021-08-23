import React from 'react'
import { render } from 'react-dom'
import { SplashScreen } from '@capacitor/splash-screen'
import { GlobalStyles } from 'twin.macro'
import { initStorage } from './src/providers/StorageProvider'
import AppStyle from './src/components/AppStyle'

const container = document.createElement('div')
document.body.append(container)

const onInit = async () => {
	window.screen.orientation.lock('portrait').catch(console.warn)
	await initStorage()
	// insert anything else you need to do/wait for before starting the app
	return {}
}

onInit().then(async (props) => {
	const App = (await import('./src/App')).default
	render(
		<>
			<AppStyle />
			<GlobalStyles />
			<App {...props} />
		</>,
		container,
	)
	SplashScreen.hide()
})
