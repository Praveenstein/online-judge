import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const ProblemDashboard = () => {
	const [problems, setProblems] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState({ title: "", statement: "", difficulty: "Medium" });
	const [submitting, setSubmitting] = useState(false);

	const token = localStorage.getItem("token");
	const headers = { Authorization: `Bearer ${token}` };

	const navigate = useNavigate();

	const fetchProblems = useCallback(async () => {
		try {
			const res = await axios.get(`${API_BASE}/problems/`);
			setProblems(res.data);
		} catch (err) {
			console.error("Failed to fetch problems");
		}
	}, []);

	useEffect(() => {
		fetchProblems();
	}, [fetchProblems]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
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
			setSubmitting(false);
		}
	};

	const deleteProblem = async (e, id) => {
		e.stopPropagation();
		if (!window.confirm("Delete this problem?")) return;
		try {
			await axios.delete(`${API_BASE}/problems/${id}`, { headers });
			fetchProblems();
		} catch (_err) {
			alert("You can only delete your own problems.");
		}
	};

	const handleEdit = (e, p) => {
		e.stopPropagation();
		setEditingId(p.id);
		setFormData({ title: p.title, statement: p.statement, difficulty: p.difficulty });
		setShowForm(true);
	};

	return (
		<div className="font-sans">
			<div className="flex justify-between items-end mb-8 border-b border-[var(--border-default)] pb-6">
				<div>
					<h1 className="text-3xl font-light tracking-tight text-[var(--text-primary)]">Problems</h1>
					<p className="text-[var(--text-secondary)] text-sm mt-1">Select a challenge to begin coding.</p>
				</div>
				<div className="flex gap-4">
					<Button
						variant={showForm ? "secondary" : "primary"}
						onClick={() => {
							setShowForm(!showForm);
							setEditingId(null);
						}}
					>
						{showForm ? "Close Form" : "Create Problem"}
					</Button>
				</div>
			</div>

			{showForm && (
				<div className="mb-12 bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-default)]">
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							placeholder="Problem Title"
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							required
							className="bg-transparent border-b border-[var(--border-default)] focus:border-[var(--border-focus)] px-0"
						/>
						<textarea
							className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded p-3 text-sm focus:border-[var(--border-focus)] outline-none h-32 text-[var(--text-primary)]"
							placeholder="Problem Statement (Markdown supported)"
							value={formData.statement}
							onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
							required
						/>
						<div className="flex justify-between items-center">
							<select
								className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none text-[var(--text-primary)]"
								value={formData.difficulty}
								onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
							>
								<option value="Easy">Easy</option>
								<option value="Medium">Medium</option>
								<option value="Hard">Hard</option>
							</select>
							<Button
								type="submit"
								disabled={submitting}
								variant="primary"
								className="flex items-center gap-2"
							>
								{submitting && (
									<div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								)}
								{submitting ? "Processing..." : editingId ? "Update" : "Post Problem"}
							</Button>
						</div>
					</form>
				</div>
			)}

			<div className="space-y-3">
				{problems.map((p) => (
					<Card
						key={p.id}
						variant="problem"
						onClick={() => navigate(`/solve/${p.id}`)}
						className="group flex items-center justify-between hover:border-[var(--border-focus)]"
					>
						<div className="flex items-baseline gap-4">
							<span className="text-[var(--text-tertiary)] font-mono text-xs">
								{p.id.toString().padStart(3, "0")}
							</span>
							<h2 className="text-md text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-primary)] transition-colors">
								{p.title}
							</h2>
							<span
								className={`text-[10px] uppercase font-bold tracking-tighter px-2 py-0.5 rounded ${p.difficulty === "Easy"
										? "text-[var(--color-success)] bg-[var(--color-success-light)]"
										: p.difficulty === "Hard"
											? "text-[var(--color-error)] bg-[var(--color-error-light)]"
											: "text-[var(--color-warning)] bg-[var(--color-warning-light)]"
									}`}
							>
								{p.difficulty}
							</span>
						</div>
						<div className="opacity-0 group-hover:opacity-100 flex gap-4 transition-opacity">
							<Button
								variant="ghost"
								size="small"
								onClick={(e) => handleEdit(e, p)}
							>
								Edit
							</Button>
							<Button
								variant="ghost"
								size="small"
								className="text-[var(--color-error)] hover:bg-[var(--color-error-light)] hover:text-[var(--color-error)]"
								onClick={(e) => deleteProblem(e, p.id)}
							>
								Delete
							</Button>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};

export default ProblemDashboard;
