// https://github.com/ben-rogerson/twin.examples
import 'twin.macro'
import styledImport from '@emotion/styled'
import { css as cssImport } from '@emotion/react'

declare module 'twin.macro' {
	// The styled and css imports
	const styled: typeof styledImport
	const css: typeof cssImport
}

// my fixes from when I was working on interpause-components

// The css prop
// https://emotion.sh/docs/typescript#css-prop
import {} from '@emotion/react/types/css-prop'

// The 'as' prop on styled components
declare global {
	namespace JSX {
		interface IntrinsicAttributes<T> extends DOMAttributes<T> {
			as?: string
		}
	}
}
