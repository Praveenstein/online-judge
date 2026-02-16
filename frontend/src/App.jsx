import { useEffect, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import Auth from "./components/Auth";
import ProblemDashboard from "./components/ProblemDashboard";
import ProblemSolve from "./pages/ProblemSolve";
import Diagram from "./components/Diagram";
import Notes from "./pages/notes";
import Layout from "./components/ui/Layout";

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
		<MantineProvider>
			<Router>
				<div className="min-h-screen bg-white">
					<Routes>
						<Route element={<Layout onLogout={logout} />}>
							{/* Main Dashboard / List */}
							<Route path="/" element={<ProblemDashboard />} />

							{/* New Solve Page */}
							<Route path="/solve/:id" element={<ProblemSolve />} />

							{/* Diagram Page */}
							<Route path="/diagram" element={<Diagram />} />

							{/* Notes Page */}
							<Route path="/notes" element={<Notes />} />
						</Route>

						{/* Redirect any unknown routes to home */}
						<Route path="*" element={<Navigate to="/" />} />
					</Routes>
				</div>
			</Router>
		</MantineProvider>
	);
}

export default App;
