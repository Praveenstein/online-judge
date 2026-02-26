// External Imports.
import axios from "axios";

// Built-In Imports.
import { useState } from "react";

const Auth = ({ onLogin }) => {
	const [loading, setLoading] = useState(false);

	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [error, setError] = useState("");

	const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			if (isLogin) {
				const params = new URLSearchParams();
				params.append("username", email);
				params.append("password", password);

				const response = await axios.post(`${API_BASE}/auth/login`, params);
				localStorage.setItem("token", response.data.access_token);
				if (rememberMe) {
					localStorage.setItem("rememberMe", "true");
					localStorage.setItem("savedEmail", email);
				} else {
					localStorage.removeItem("rememberMe");
					localStorage.removeItem("savedEmail");
				}
				onLogin(); // Trigger the redirect/state update in App.jsx
			} else {
				await axios.post(`${API_BASE}/auth/register`, { email, password });
				alert("Account created!");
				setIsLogin(true);
			}
		} catch (err) {
			setError(err.response?.data?.detail || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex font-sans bg-[#F7F6F3]">
			{/* Left side - Landing Page Value Prop */}
			<div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24">
				<div className="max-w-2xl">
					<h1 className="text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
						Your Personal DSA <br className="hidden xl:block" /> Learning Companion
					</h1>
					<p className="text-xl text-slate-600 mb-10 leading-relaxed">
						Take notes, practice problems, get AI validation, and track your growth - all in one place.
					</p>

					<div className="space-y-6">
						<div className="flex items-start">
							<div className="flex-shrink-0 mt-1">
								<svg className="w-5 h-5 text-[#2383E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
							</div>
							<div className="ml-4">
								<h3 className="text-lg font-medium text-slate-900">Intelligent Note-Taking</h3>
								<p className="mt-1 text-slate-500">Rich text, Excalidraw diagrams, and executable code blocks in one place.</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="flex-shrink-0 mt-1">
								<svg className="w-5 h-5 text-[#2383E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<div className="ml-4">
								<h3 className="text-lg font-medium text-slate-900">Smart Problem Discovery</h3>
								<p className="mt-1 text-slate-500">Searches the web for problems based on your learning goals and weaknesses.</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="flex-shrink-0 mt-1">
								<svg className="w-5 h-5 text-[#2383E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="ml-4">
								<h3 className="text-lg font-medium text-slate-900">AI Test Validation</h3>
								<p className="mt-1 text-slate-500">Generate test cases and validate your solution locally before submitting.</p>
							</div>
						</div>

						<div className="flex items-start">
							<div className="flex-shrink-0 mt-1">
								<svg className="w-5 h-5 text-[#2383E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
								</svg>
							</div>
							<div className="ml-4">
								<h3 className="text-lg font-medium text-slate-900">Personalized Flashcards</h3>
								<p className="mt-1 text-slate-500">Auto-generated flashcards based on your attempted problems and weaknesses.</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Login Form */}
			<div className="flex-1 lg:flex-none lg:w-[480px] bg-white flex flex-col justify-center px-8 sm:px-12 xl:px-16 shadow-[0_0_40px_rgba(0,0,0,0.05)] border-l border-slate-200/60 relative z-10">

				{/* Mobile Logo/Title (Visible only on small screens) */}
				<div className="lg:hidden mb-10">
					<h1 className="text-3xl font-bold text-slate-900 mb-2">DSA Companion</h1>
					<p className="text-slate-600">Your Personal Learning Journey</p>
				</div>

				<div className="w-full max-w-sm mx-auto">
					<div className="mb-8">
						<h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">
							{isLogin ? "Welcome back to your learning journey" : "Begin Your Journey"}
						</h2>
						<p className="text-sm text-slate-500">
							{isLogin ? "Enter your email and password to log in." : "Create an account to track your progress."}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-slate-700 mb-1.5"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								required
								className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] transition-colors sm:text-sm"
								placeholder="name@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-slate-700 mb-1.5"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								required
								className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2383E2]/20 focus:border-[#2383E2] transition-colors sm:text-sm"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>

						{isLogin && (
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									className="h-4 w-4 text-[#2383E2] focus:ring-[#2383E2] border-slate-300 rounded"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
								/>
								<label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
									Remember me
								</label>
							</div>
						)}

						{error && <p className="text-red-500 text-sm mt-2">{error}</p>}

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[#2383E2] text-white py-2.5 rounded-md text-sm font-medium hover:bg-[#1C6CBA] disabled:opacity-50 transition-colors mt-2 flex justify-center items-center shadow-sm"
						>
							{loading ? (
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : isLogin ? (
								"Log In"
							) : (
								"Start Learning Free"
							)}
						</button>
					</form>

					<div className="mt-8 pt-6 border-t border-slate-100 text-center">
						<p className="text-sm text-slate-600">
							{isLogin ? "Don't have an account? " : "Already have an account? "}
							<button
								type="button"
								onClick={() => setIsLogin(!isLogin)}
								className="font-medium text-[#2383E2] hover:text-[#1C6CBA] transition-colors"
							>
								{isLogin ? "Sign up" : "Log in"}
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Auth;
