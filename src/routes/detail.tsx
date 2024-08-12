import {
	ActionFunction,
	json,
	LoaderFunction,
	redirect,
	useFetcher,
	useLoaderData,
	useNavigation,
	useParams,
} from 'react-router-dom'
import {
	fetchSingleDayCommits,
	GithubCommitActivitySingleDaySchema,
} from '../utils'
import { z } from 'zod'
import Spinner from '../components/spinner'
import Sparkles from '../components/sparkles'
import { useEffect, useState } from 'react'

const WeekDayParamsSchema = z.object({
	week: z.string().transform(Number),
	day: z.string().transform(Number),
})

type LoaderData = {
	data: z.infer<typeof GithubCommitActivitySingleDaySchema>
}

export const loader: LoaderFunction = async ({ params }) => {
	const parsedParams = WeekDayParamsSchema.safeParse(params)

	if (!parsedParams.success) {
		return redirect('/')
	}

	const { week, day } = parsedParams.data
	const data = await fetchSingleDayCommits(week, day)

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

function useDayFromParams() {
	const params = useParams()
	const { week, day } = WeekDayParamsSchema.parse(params)
	const date = new Date(week * 1000 + day * 24 * 60 * 60 * 1000)
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: 'UTC',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})

	return formatter.format(date)
}

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
	const { data } = useLoaderData() as LoaderData
	const navigation = useNavigation()
	const fetcher = useFetcher()
	const actionData = fetcher.data as { summary?: string; error?: string }
	const day = useDayFromParams()

	const [fetcherData, setFetcherData] = useState<typeof actionData | null>(
		actionData,
	)

	useEffect(() => {
		setFetcherData(actionData)
	}, [actionData])

	/** This is a workaround to clean the state when we navigate to a different day. */
	useEffect(() => {
		setFetcherData(null)
	}, [navigation.location?.hash])

	return (
		<>
			<h3>Details for {day}:</h3>
			<fetcher.Form method="post">
				<button type="submit" disabled={fetcher.state !== 'idle'}>
					What was worked on this day?{' '}
					{fetcher.state !== 'idle' ? <Spinner /> : <Sparkles />}
				</button>
				{data.map(({ commit }) => (
					<input
						key={commit.url}
						name="messages"
						type="hidden"
						value={commit.message}
					/>
				))}
			</fetcher.Form>
			<p>{fetcherData?.summary}</p>
			<ul className="commits">
				{data?.map(({ sha, commit, author, html_url }) => (
					<li key={sha} className="commit">
						<a href={html_url} aria-disabled={navigation.state !== 'idle'}>
							{sha.substring(0, 6)}
							{navigation.state === 'loading' ? <Spinner /> : null}
						</a>
						<img
							width={20}
							height={20}
							src={author.avatar_url}
							alt="Author profile picture."
						/>
						<span>{commit.author.name}</span>
						<a href={author.html_url}>{author.login}</a>
						<p>{commit.message}</p>
					</li>
				))}
			</ul>
		</>
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
