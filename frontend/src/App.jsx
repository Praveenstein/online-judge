import { useEffect, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import ProblemDashboard from "./components/ProblemDashboard";
import ProblemSolve from "./pages/ProblemSolve";

function App() {
	const [token, setToken] = useState(localStorage.getItem("token"));

	useEffect(() => {
		const handleStorage = () => setToken(localStorage.getItem("token"));
		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, []);

	if (!token) {
		return <Auth onLogin={() => setToken(localStorage.getItem("token"))} />;
	}

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
	};

	return (
		<Router>
			<div className="min-h-screen bg-white">
				<Routes>
					{/* Main Dashboard / List */}
					<Route path="/" element={<ProblemDashboard onLogout={logout} />} />

					{/* New Solve Page */}
					<Route path="/solve/:id" element={<ProblemSolve />} />

					{/* Redirect any unknown routes to home */}
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
