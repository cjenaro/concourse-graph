import { useFetcher, useNavigation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Spinner from './spinner'
import Sparkles from './sparkles'
import { z } from 'zod'
import { GithubCommitActivitySingleDaySchema } from '../utils'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function AISummary({
	commits,
}: {
	commits: z.infer<typeof GithubCommitActivitySingleDaySchema>
}) {
	const navigation = useNavigation()
	const fetcher = useFetcher({ key: 'ai-fetcher' })
	const actionData = fetcher.data as { summary?: string; error?: string }

	const [fetcherData, setFetcherData] = useState<typeof actionData | null>(
		actionData,
	)

	// const summary = useAnimatedSummaryText(fetcherData?.summary)

	useEffect(() => {
		setFetcherData(actionData)
	}, [actionData])

	/** This is a workaround to clean the state when we navigate to a different day. */
	useEffect(() => {
		setFetcherData(null)
	}, [navigation.location?.hash])

	useGSAP(() => {
		const tl = gsap.timeline()
		tl.to('.ai-summary', {
			duration: 0.3,
			padding: fetcherData?.summary ? 20 : 0,
		})
		tl.to('.ai-summary', {
			width: fetcherData?.summary ? 'auto' : 115, //'var(--btn-width)',
			delay: 0.3,
			duration: 0.3,
		})
		tl.from('.cancel-ai', {
			duration: 0.3,
			opacity: fetcherData?.summary ? 0 : 1,
			width: fetcherData?.summary ? 0 : 'auto',
		})
		tl.from('.summary-animation', {
			ease: 'none',
			text: {
				value: '',
				speed: 3,
			},
		})
	}, [fetcherData?.summary])

	return (
		<div className="ai-summary">
			<fetcher.Form method="post">
				<button type="submit" disabled={fetcher.state !== 'idle'}>
					{fetcherData?.error
						? 'There was an error, try again. '
						: 'AI Summary '}
					{fetcher.state !== 'idle' ? <Spinner /> : <Sparkles />}
				</button>
				{commits.map(({ commit }) => (
					<input
						key={commit.url}
						name="messages"
						type="hidden"
						value={commit.message}
					/>
				))}
			</fetcher.Form>
			{fetcherData?.summary ? (
				<button
					className="cancel-ai"
					aria-label="Cancel"
					onClick={() => setFetcherData(null)}
				>
					&times;
				</button>
			) : null}
			{fetcherData?.summary ? (
				<p className="summary-animation">{fetcherData.summary}</p>
			) : null}
		</div>
	)
}
