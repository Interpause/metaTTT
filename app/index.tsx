import React from 'react'
import { render } from 'react-dom'
import { SplashScreen } from '@capacitor/splash-screen'
import { GlobalStyles } from 'twin.macro'
import App from './src/App'
import { initStorage, StorageProvider } from './src/providers/StorageProvider'

const container = document.createElement('div')
document.body.append(container)

const onInit = async () => {
	await initStorage()

	// insert anything else you need to do/wait for before starting the app
	return {}
}

onInit().then((props) => {
	render(
		<>
			<GlobalStyles />
			<StorageProvider>
				<App {...props} />
			</StorageProvider>
		</>,
		container,
	)
	SplashScreen.hide()
})
