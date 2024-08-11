import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App, { loader } from './App.tsx'
import './index.css'
import SingleDayDetails, {
	loader as singleDayDetailsLoader,
} from './routes/detail.tsx'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		loader,
		children: [
			{
				path: ':week/:day',
				element: <SingleDayDetails />,
				loader: singleDayDetailsLoader,
			},
		],
	},
])

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
