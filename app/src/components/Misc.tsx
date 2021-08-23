import React, { ComponentPropsWithRef, MouseEventHandler } from 'react'
import tw, { css } from 'twin.macro'

export const ButtonStyle = css`
	${tw`bg-yellow-500 text-white rounded h-16 w-16 focus:outline-none transition-shadow duration-75`}
	border: thin solid white;
	font-size: 90%;

	img,
	svg {
		${tw`mx-auto height[60%] width[60%]`}
	}

	&:active {
		box-shadow: 0 0 0.2rem 0.2rem rgba(0, 0, 0, 0.5) inset;
	}

	&:disabled {
		${tw`bg-gray-400`}
	}
`

const clickSound = new Audio(require('../assets/audio/click.mp3'))

export function Button({ onClick, ...props }: ComponentPropsWithRef<'button'>) {
	const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
		clickSound.play()
		onClick && onClick(e)
	}
	return <button css={ButtonStyle} onClick={handleClick} {...props} />
}

/** 4 buttons max */
export const ButtonBar = tw.div`grid w-full grid-cols-4 place-items-center py-2`
