// External Imports.
import axios from "axios";

// Built-In Imports.
import { useState } from "react";

const Auth = ({ onLogin }) => {
	const [loading, setLoading] = useState(false);

	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			if (isLogin) {
				const params = new URLSearchParams();
				params.append("username", email);
				params.append("password", password);

				const response = await axios.post("http://localhost:8000/auth/login", params);
				localStorage.setItem("token", response.data.access_token);
				onLogin(); // Trigger the redirect/state update in App.jsx
			} else {
				await axios.post("http://localhost:8000/auth/register", { email, password });
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
		<div className="min-h-screen flex items-center justify-center bg-white text-slate-900 font-sans px-4">
			<div className="w-full max-w-sm">
				<div className="mb-10 text-center">
					<h1 className="text-2xl font-light tracking-tight text-slate-950">
						{isLogin ? "Welcome back" : "Create an account"}
					</h1>
					<p className="text-sm text-slate-500 mt-2">
						{isLogin ? "Enter your details to access the judge." : "Join the coding community."}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1"
						>
							Email
						</label>
						<input
							id="email" // Added id to link with label
							type="email"
							required
							className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-900 transition-colors text-sm"
							placeholder="name@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div>
						<label
							htmlFor="password"
							className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1"
						>
							Password
						</label>
						<input
							id="password" // Added id to link with label
							type="password"
							required
							className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-900 transition-colors text-sm"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					{error && <p className="text-red-500 text-xs mt-2">{error}</p>}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-slate-950 text-white py-3 rounded-md text-sm font-medium hover:bg-slate-800 disabled:bg-slate-400 transition-all mt-4 flex justify-center items-center"
					>
						{loading ? (
							<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						) : isLogin ? (
							"Sign In"
						) : (
							"Create Account"
						)}
					</button>
				</form>

				<div className="mt-8 text-center">
					<button
						type="button"
						onClick={() => setIsLogin(!isLogin)}
						className="text-xs text-slate-500 hover:text-slate-950 underline underline-offset-4"
					>
						{isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default Auth;
