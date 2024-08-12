import '@netlify/functions'
import { z } from 'zod'

const MessagesSchema = z.array(z.string())

const openApiKey = Netlify.env.get('OPENAPI_KEY')

export default async (request: Request) => {
	const formData = await request.formData()
	const messages = MessagesSchema.parse(formData.getAll('messages'))

	const response = await getWhatWasWorkedOn(messages).then((b) => b.json())

	return new Response(JSON.stringify(response), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	})
}

export async function getWhatWasWorkedOn(messages: string[]) {
	const prompt = `
Here is a list of commit messages from people about what they were working on today:\n
${messages}\n
Give me a quick summary of what was worked on today.
Avoid any introductions like "Here's a summary...", give me a summary of 6 lines and do not use any MD formatting.
Do not say anything if there are no messages in the list, just say that nothing was commited that day.
Fidelity to the messages is 100% priority.
`

	return fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		body: JSON.stringify({
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: 'You are a helpful assistant.' },
				{ role: 'user', content: prompt },
			],
		}),
		headers: {
			Authorization: `Bearer ${openApiKey}`,
			'Content-Type': 'application/json',
		},
	})
}
