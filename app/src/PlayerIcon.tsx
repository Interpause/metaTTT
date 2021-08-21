import React from 'react'

export function DefaultPlayerIcon({ color }: { color: string }) {
	return (
		<svg viewBox='0 0 256 256'>
			<rect x='0' y='0' width='100%' height='100%' fill={color} />
		</svg>
	)
}
