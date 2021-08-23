import React, { ReactNode } from 'react'

export function BasePlayerIcon({
	color,
	children,
}: {
	color: string
	children?: ReactNode
}) {
	return <svg viewBox='0 0 256 256'>{children}</svg>
}
