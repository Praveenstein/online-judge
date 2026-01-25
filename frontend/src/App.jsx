import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import ProblemDashboard from "./components/ProblemDashboard";

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

	return (
		<div className="min-h-screen bg-white">
			<ProblemDashboard
				onLogout={() => {
					localStorage.removeItem("token");
					setToken(null);
				}}
			/>
		</div>
	);
}

export default App;
