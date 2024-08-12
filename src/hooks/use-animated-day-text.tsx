import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import TextPlugin from 'gsap/TextPlugin'
import { useParams } from 'react-router-dom'
import { WeekDayParamsSchema } from '../routes/detail'
import { useRef } from 'react'

gsap.registerPlugin(useGSAP, TextPlugin)

export function useDayFromParams() {
	const params = useParams()
	const { success, data } = WeekDayParamsSchema.safeParse(params)
	if (!success) return ''
	const { week, day } = data
	const date = new Date(week * 1000 + day * 24 * 60 * 60 * 1000)
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: 'UTC',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})

	return formatter.format(date)
}

export function useAnimatedDayText() {
	const oldDay = useRef('')
	const day = useDayFromParams()

	useGSAP(
		() => {
			gsap.from('.day-animation', {
				duration: 0.5,
				text: {
					value: oldDay.current,
					type: 'diff',
				},
			})

			oldDay.current = day
		},
		{
			dependencies: [day],
		},
	)

	return <h3 className="day-animation">{day}</h3>
}
