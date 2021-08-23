import tw, { styled } from 'twin.macro'

export const Button = styled.button`
	${tw`bg-yellow-600 text-white p-1 rounded`}
	border: thin solid white;
	font-size: 90%;

	svg {
		${tw`p-0 m-0`}
		height: 60%;
		width: 60%;
	}
`
