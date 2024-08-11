import {
	ActionFunction,
	json,
	LoaderFunction,
	redirect,
	useFetcher,
	useLoaderData,
	useNavigation,
} from 'react-router-dom'
import {
	fetchSingleDayCommits,
	GithubCommitActivitySingleDaySchema,
} from '../utils'
import { z } from 'zod'
import Spinner from '../components/spinner'

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
		console.error(parsedParams.error.errors)
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

export const action: ActionFunction = async ({ request }) => {
	const data = await request.formData()
	const response = await fetch('/openapi', {
		method: 'POST',
		body: data,
	}).then((blob) => blob.json())

	const result = OpenAPIResponseSchema.safeParse(response)

	console.log(result)

	if (!result.success) {
		console.log(result.error.errors)
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

	return (
		<>
			<h3>Details:</h3>
			<fetcher.Form method="post">
				<button type="submit" disabled={fetcher.state !== 'idle'}>
					What was worked on this day?{' '}
					{fetcher.state !== 'idle' ? (
						<Spinner />
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="sparkles"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
							/>
						</svg>
					)}
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
			<p>{actionData?.summary}</p>
			{navigation.state === 'loading' ? (
				<p>Loading...</p>
			) : (
			<ul className="commits">
				{data?.map(({ sha, commit, author, html_url }) => (
					<li key={sha} className="commit">
						<a href={html_url}>{sha.substring(0, 6)}</a>
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
			)}
		</>
	)
}
