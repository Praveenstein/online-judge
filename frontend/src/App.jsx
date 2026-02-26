import { useEffect, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import Auth from "./components/Auth";
import Notes from "./pages/notes";
import DSAChat from "./pages/DSAChat";
import FlashCards from "./pages/FlashCards";
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
							{/* Root Redirect */}
							<Route path="/" element={<Navigate to="/notes" replace />} />

							{/* Notes Page */}
							<Route path="/notes" element={<Notes />} />

							{/* DSA Search Page */}
							<Route path="/dsa-search" element={<DSAChat />} />

							{/* Flash Cards Page */}
							<Route path="/flash-cards" element={<FlashCards />} />
						</Route>

						{/* Redirect any unknown routes to notes */}
						<Route path="*" element={<Navigate to="/notes" replace />} />
					</Routes>
				</div>
			</Router>
		</MantineProvider>
	);
}

export default App;
