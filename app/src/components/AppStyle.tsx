import { Global } from '@emotion/react'
import { css } from 'twin.macro'

// some style resets here
const style = css`
	:root {
		appearance: none;
		text-size-adjust: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
`

export default function AppStyle() {
	return <Global styles={style} />
}
