import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const ProblemDashboard = ({ onLogout }) => {
	const [problems, setProblems] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState({ title: "", statement: "", difficulty: "Medium" });
	const [submitting, setSubmitting] = useState(false);

	const token = localStorage.getItem("token");
	const headers = { Authorization: `Bearer ${token}` };

	const navigate = useNavigate();

	// Wrap fetchProblems in useCallback
	const fetchProblems = useCallback(async () => {
		try {
			const res = await axios.get(`${API_BASE}/problems/`);
			setProblems(res.data);
		} catch (err) {
			console.error("Failed to fetch problems");
		}
	}, []); // Empty array because it doesn't depend on any changing state

	// Now this effect only runs once on mount
	useEffect(() => {
		fetchProblems();
	}, [fetchProblems]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true); // Start processing
		try {
			if (editingId) {
				await axios.put(`${API_BASE}/problems/${editingId}`, formData, { headers });
			} else {
				await axios.post(`${API_BASE}/problems/`, formData, { headers });
			}
			setFormData({ title: "", statement: "", difficulty: "Medium" });
			setShowForm(false);
			setEditingId(null);
			await fetchProblems();
		} catch (err) {
			alert(err.response?.data?.detail || "Action failed");
		} finally {
			setSubmitting(false); // End processing
		}
	};

	const deleteProblem = async (id) => {
		if (!window.confirm("Delete this problem?")) return;
		try {
			await axios.delete(`${API_BASE}/problems/${id}`, { headers });
			fetchProblems();
		} catch (_err) {
			alert("You can only delete your own problems.");
		}
	};

	return (
		<div className="max-w-4xl mx-auto py-12 px-6 font-sans text-slate-900">
			<div className="flex justify-between items-end mb-12 border-b border-slate-100 pb-6">
				<div>
					<h1 className="text-3xl font-light tracking-tight text-slate-950">Problems</h1>
					<p className="text-slate-500 text-sm mt-1">Select a challenge to begin coding.</p>
				</div>
				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => {
							setShowForm(!showForm);
							setEditingId(null);
						}}
						className="text-xs uppercase tracking-widest font-bold text-slate-950 hover:opacity-60 transition-opacity"
					>
						{showForm ? "[ Close ]" : "[ Create Problem ]"}
					</button>
					<button
						type="button"
						onClick={onLogout}
						className="text-xs uppercase tracking-widest font-bold text-red-500 hover:opacity-60"
					>
						Logout
					</button>
				</div>
			</div>

			{showForm && (
				<form
					onSubmit={handleSubmit}
					className="mb-12 space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-200"
				>
					<input
						className="w-full bg-transparent text-xl font-light border-b border-slate-300 focus:border-slate-900 outline-none pb-2"
						placeholder="Problem Title"
						value={formData.title}
						onChange={(e) => setFormData({ ...formData, title: e.target.value })}
						required
					/>
					<textarea
						className="w-full bg-transparent border border-slate-300 rounded p-3 text-sm focus:border-slate-900 outline-none h-32"
						placeholder="Problem Statement (Markdown supported)"
						value={formData.statement}
						onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
						required
					/>
					<div className="flex justify-between items-center">
						<select
							className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none"
							value={formData.difficulty}
							onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
						>
							<option value="Easy">Easy</option>
							<option value="Medium">Medium</option>
							<option value="Hard">Hard</option>
						</select>
						<button
							type="submit"
							disabled={submitting}
							className="bg-slate-950 text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-widest disabled:bg-slate-400 flex items-center gap-2"
						>
							{submitting && (
								<div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							)}
							{submitting ? "Processing..." : editingId ? "Update" : "Post Problem"}
						</button>
					</div>
				</form>
			)}

			<div className="space-y-1">
				{problems.map((p) => (
					<div
						key={p.id}
						className="group flex items-center justify-between py-4 border-b border-slate-50 hover:bg-slate-50 px-2 transition-colors"
					>
						<div className="flex items-baseline gap-4">
							<span className="text-slate-300 font-mono text-xs">
								{p.id.toString().padStart(3, "0")}
							</span>
							<h2
								onClick={() => navigate(`/solve/${p.id}`)}
								className="text-md text-slate-800 group-hover:text-blue-600 cursor-pointer font-medium"
							>
								{p.title}
							</h2>
							<span
								className={`text-[10px] uppercase font-bold tracking-tighter px-2 py-0.5 rounded ${
									p.difficulty === "Easy"
										? "text-green-600 bg-green-50"
										: p.difficulty === "Hard"
											? "text-red-600 bg-red-50"
											: "text-amber-600 bg-amber-50"
								}`}
							>
								{p.difficulty}
							</span>
						</div>
						<div className="opacity-0 group-hover:opacity-100 flex gap-4 transition-opacity">
							<button
								type="button"
								onClick={() => {
									setEditingId(p.id);
									setFormData({ title: p.title, statement: p.statement, difficulty: p.difficulty });
									setShowForm(true);
								}}
								className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-900"
							>
								Edit
							</button>
							<button
								type="button"
								onClick={() => deleteProblem(p.id)}
								className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-600"
							>
								Delete
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ProblemDashboard;
