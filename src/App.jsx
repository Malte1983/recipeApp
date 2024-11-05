// src/App.jsx
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
	Link,
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddRecipe from './components/AddRecipe';
import Login from './components/Login';
import RecipeList from './components/RecipeList';
import { auth } from './firebase';

function App() {
	const [user] = useAuthState(auth);
	const [wakeLock, setWakeLock] = useState(null);

	const handleLogout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error('Fehler beim Ausloggen:', error);
		}
	};

	const handleNavigationToRecipes = () => {
		setSelectedRecipe(null); // Zurücksetzen des Zustands, um zur Liste zu navigieren
		navigate('/');
	};

	const vibrate = () => {
		if (navigator.vibrate) {
			navigator.vibrate(100); // Vibrieren für 100 Millisekunden
		}
	};

	const requestWakeLock = async () => {
		try {
			if ('wakeLock' in navigator) {
				const lock = await navigator.wakeLock.request('screen');
				setWakeLock(lock);

				// Falls das Wake Lock aus irgendeinem Grund aufgehoben wird, erneutes Anfordern
				lock.addEventListener('release', () => {
					console.log('Wake Lock released');
				});
			} else {
				console.warn('Wake Lock API wird in diesem Browser nicht unterstützt.');
			}
		} catch (error) {
			console.error('Fehler beim Anfordern des Wake Lock:', error);
		}
	};

	// Effekt-Hook zur Verwaltung des Wake Lock während der App-Laufzeit
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				requestWakeLock();
			} else if (wakeLock) {
				wakeLock.release();
			}
		};

		// Sichtbarkeitsüberwachung hinzufügen
		document.addEventListener('visibilitychange', handleVisibilityChange);

		requestWakeLock(); // Initiales Wake Lock setzen

		// Aufräumen bei Komponentenausblendung
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			if (wakeLock) {
				wakeLock.release();
			}
		};
	}, [wakeLock]);

	return (
		<Router>
			<div className='flex flex-col min-h-screen'>
				<nav className='bg-blue-600 p-4 shadow-md sticky top-0 z-50'>
					<div className='container mx-auto flex justify-between items-center'>
						<Link
							onClick={() => {
								vibrate(); // Vibration auslösen
								handleNavigationToRecipes(); // Navigation durchführen
							}}
							to='/'
							className='text-white text-lg font-semibold'
						>
							Malte's Rezepte
						</Link>
						<div className='flex items-center space-x-4'>
							{user ? (
								<>
									<Link to='/add' className='text-white hover:underline'>
										Neues Rezept
									</Link>
									<button
										onClick={() => {
											vibrate(); // Vibration auslösen
											handleLogout(); // Ausloggen
										}}
										className='text-white hover:underline'
									>
										Logout
									</button>
								</>
							) : (
								<Link to='/login' className='text-white hover:underline'>
									Login
								</Link>
							)}
						</div>
					</div>
				</nav>
				<main className='flex-grow container mx-auto p-4'>
					<Routes>
						<Route path='/' element={<RecipeList />} />
						<Route
							path='/add'
							element={user ? <AddRecipe /> : <Navigate to='/login' />}
						/>
						<Route
							path='/login'
							element={user ? <Navigate to='/' /> : <Login />}
						/>
					</Routes>
				</main>
				<ToastContainer
					position='top-right'
					autoClose={3000}
					hideProgressBar={false}
					closeOnClick
					pauseOnHover
					draggable
					pauseOnFocusLoss
					transition={zoom}
				/>
			</div>
		</Router>
	);
}

export default App;
