import {
	ActionFunction,
	json,
	LoaderFunction,
	redirect,
	useLoaderData,
} from 'react-router-dom'
import {
	fetchSingleDayCommits,
	GithubCommitActivitySingleDaySchema,
} from '../utils'
import { z } from 'zod'
import { useDayFromParams } from '../hooks/use-animated-day-text'
import CommitMessage from '../components/commit-message'
import AISummary from '../components/ai-summary'

export const WeekDayParamsSchema = z.object({
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

export const action: ActionFunction = async ({ request }) => {
	const data = await request.formData()
	try {
		const response = await fetch('/api/openapi', {
			method: 'POST',
			body: data,
		}).then((blob) => blob.json())

		const result = OpenAPIResponseSchema.safeParse(response)

		if (!result.success) {
			throw new Error(result.error.errors.join(','))
		}

		const [choice] = result.data?.choices

		return json({ summary: choice.message.content })
	} catch (error) {
		return json({
			error:
				error instanceof Error
					? error.message
					: 'There was an error in the details page',
		})
	}
}

export default function SingleDayDetails() {
	const { data: commits } = useLoaderData() as LoaderData

	return (
		<div className="details-page">
			<AISummary commits={commits} />
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
