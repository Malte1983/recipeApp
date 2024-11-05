import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BiSolidHide, BiSolidShow } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function Login() {
	const [user] = useAuthState(auth);
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);

	// Überprüfen, ob der Benutzer eingeloggt ist
	React.useEffect(() => {
		if (user) {
			// Wenn der Benutzer eingeloggt ist, leite ihn zur Rezeptliste weiter
			navigate('/');
		}
	}, [user, navigate]);

	const handleLogin = async (e) => {
		e.preventDefault();
		const email = e.target.email.value;
		const password = e.target.password.value;

		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.error('Fehler beim Einloggen:', error);
		}
	};

	return (
		<div className='flex items-center justify-center h-screen bg-gray-100'>
			<div className='bg-white rounded-lg shadow-md p-8 max-w-md w-full'>
				<h2 className='text-2xl font-bold text-center mb-6'>Login</h2>
				<form onSubmit={handleLogin}>
					<input
						type='email'
						name='email'
						placeholder='E-Mail'
						required
						className='border border-gray-300 p-3 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
					/>
					<div className='relative mb-4'>
						<input
							type={showPassword ? 'text' : 'password'} // Zeige Passwort oder nicht
							name='password'
							placeholder='Passwort'
							required
							className='border border-gray-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						/>
						<button
							type='button'
							className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500'
							onClick={() => setShowPassword(!showPassword)} // Umschalten der Sichtbarkeit
						>
							{showPassword ? (
								<BiSolidHide size={25} />
							) : (
								<BiSolidShow size={25} />
							)}
						</button>
					</div>
					<button
						type='submit'
						className='bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600 transition'
					>
						Einloggen
					</button>
				</form>
			</div>
		</div>
	);
}

export default Login;
