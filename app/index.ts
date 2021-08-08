import { createElement as e } from 'react'
import { render } from 'react-dom'

import App from './src/App'

const container = document.createElement('div')
document.body.append(container)

render(e(App), container)
