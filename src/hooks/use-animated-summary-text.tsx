import { useGSAP } from '@gsap/react'
import TextPlugin from 'gsap/TextPlugin'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP, TextPlugin)

export function useAnimatedSummaryText(text?: string) {
	useGSAP(
		() => {
			gsap.from('.summary-animation', {
				ease: 'none',
				text: {
					value: '',
					speed: 3,
				},
			})
		},
		{
			dependencies: [text],
		},
	)

	return <p className="summary-animation">{text}</p>
}
