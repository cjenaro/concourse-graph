import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home, { loader, HomeErrorElement } from './routes/home.tsx'
import './index.css'
import SingleDayDetails, {
	loader as singleDayDetailsLoader,
	action as singleDayDetailsAction,
	SingleDayDetailsErrorElement,
} from './routes/detail.tsx'
import NotFound from './routes/not-found.tsx'

const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />,
		loader,
		errorElement: <HomeErrorElement />,
		children: [
			{
				path: ':week/:day',
				element: <SingleDayDetails />,
				loader: singleDayDetailsLoader,
				action: singleDayDetailsAction,
				errorElement: <SingleDayDetailsErrorElement />,
			},
			{
				path: '*',
				element: <NotFound />,
			},
		],
	},
])

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
