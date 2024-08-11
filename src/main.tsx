import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home, { loader } from './routes/home.tsx'
import './index.css'
import SingleDayDetails, {
	loader as singleDayDetailsLoader,
	action as singleDayDetailsAction,
} from './routes/detail.tsx'

const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />,
		loader,
		children: [
			{
				path: ':week/:day',
				element: <SingleDayDetails />,
				loader: singleDayDetailsLoader,
				action: singleDayDetailsAction,
			},
		],
	},
])

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
