import { json, LoaderFunction, redirect, useLoaderData } from 'react-router-dom'
import { fetchSingleDayCommits } from '../utils'
import { z } from 'zod'

const WeekDayParamsSchema = z.object({
	week: z.string().transform(Number),
	day: z.string().transform(Number),
})

type LoaderData = {
	data: any // TODO: replace with real type
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

export default function SingleDayDetails() {
	const { data } = useLoaderData() as LoaderData

	return (
		<>
			<h3>Details:</h3>
			<ul>
				{data.map(({ sha, commit, author }) => (
					<li key={sha}>
						<p>{commit.author.name}</p> -{' '}
						<a href={author.html_url}>{author.login}</a>
						<p>{commit.message}</p>
					</li>
				))}
			</ul>
		</>
	)
}
