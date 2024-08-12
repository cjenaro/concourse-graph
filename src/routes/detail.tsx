import {
	ActionFunction,
	json,
	LoaderFunction,
	redirect,
	useFetcher,
	useFetchers,
	useLoaderData,
	useLocation,
	useNavigation,
} from 'react-router-dom'
import {
	fetchSingleDayCommits,
	GithubCommitActivitySingleDaySchema,
} from '../utils'
import { z } from 'zod'
import Spinner from '../components/spinner'
import Sparkles from '../components/sparkles'
import { useEffect, useState } from 'react'
import { useDayFromParams } from '../hooks/use-animated-day-text'
import { useAnimatedSummaryText } from '../hooks/use-animated-summary-text'
import CommitMessage from '../components/commit-message'

export const WeekDayParamsSchema = z.object({
	week: z.string().transform(Number),
	day: z.string().transform(Number),
})

type LoaderData = {
	data: z.infer<typeof GithubCommitActivitySingleDaySchema>
}

export const loader: LoaderFunction = async ({ params, request }) => {
	const parsedParams = WeekDayParamsSchema.safeParse(params)
	const searchParams = new URL(request.url).searchParams
	const repo = searchParams.get('repo') || undefined

	if (!parsedParams.success) {
		return redirect('/')
	}

	const { week, day } = parsedParams.data
	const data = await fetchSingleDayCommits(week, day, repo)

	return json({ data })
}

const OpenAPIResponseSchema = z.object({
	id: z.string(),
	object: z.string(),
	created: z.number(),
	model: z.string(),
	choices: z.array(
		z.object({
			index: z.number(),
			message: z.object({
				role: z.string(),
				content: z.string(),
				refusal: z.null(),
			}),
			logprobs: z.null(),
			finish_reason: z.string(),
		}),
	),
	usage: z.object({
		prompt_tokens: z.number(),
		completion_tokens: z.number(),
		total_tokens: z.number(),
	}),
})

export const action: ActionFunction = async ({ request }) => {
	const data = await request.formData()
	const response = await fetch('/api/openapi', {
		method: 'POST',
		body: data,
	}).then((blob) => blob.json())

	const result = OpenAPIResponseSchema.safeParse(response)

	if (!result.success) {
		return json({
			error: 'Could not fetch the open api response',
		})
	}

	const [choice] = result.data?.choices

	return json({ summary: choice.message.content })
}

export default function SingleDayDetails() {
	const navigation = useNavigation()
	const { data: commits } = useLoaderData() as LoaderData
	const location = useLocation()
	const fetcher = useFetcher({ key: 'commits-fetcher' })
	const actionData = fetcher.data as { summary?: string; error?: string }

	const [fetcherData, setFetcherData] = useState<typeof actionData | null>(
		actionData,
	)

	const summary = useAnimatedSummaryText(fetcherData?.summary)

	useEffect(() => {
		setFetcherData(actionData)
	}, [actionData])

	/** This is a workaround to clean the state when we navigate to a different day. */
	useEffect(() => {
		setFetcherData(null)
	}, [navigation.location?.hash])

	const fetchers = useFetchers()
	const searchFetcher = fetchers.find((f) => f.key === 'search')

	useEffect(() => {
		if (location?.pathname) {
			const search = searchFetcher?.data.repo
				? '?repo=' + searchFetcher?.data.repo
				: location.search
			fetcher.load(location?.pathname + search)
		}
	}, [searchFetcher?.data?.repo])

	return (
		<div className="details-page">
			<fetcher.Form method="post">
				<button type="submit" disabled={fetcher.state !== 'idle'}>
					What was worked on this day?{' '}
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
			{summary}
			<ul className="commits">
				{commits?.map((commit, idx) => (
					<CommitMessage key={commit.sha} commit={commit} delay={idx} />
				))}
			</ul>
		</div>
	)
}

export function SingleDayDetailsErrorElement() {
	const day = useDayFromParams()
	return (
		<div>
			<p>There was an error while fetching the data for the day {day}</p>
		</div>
	)
}
