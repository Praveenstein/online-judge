import Editor from "@monaco-editor/react";
import axios from "axios";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";

const ProblemSolve = () => {
	const { id } = useParams();
	const [problem, setProblem] = useState(null);
	const [language, setLanguage] = useState("python");
	const [code, setCode] = useState("# Write your code here");
	const [inputData, setInputData] = useState("");
	const [output, setOutput] = useState({ stdout: "", stderr: "", exit_code: null });
	const [loading, setLoading] = useState(false);
	const [reviewLoading, setReviewLoading] = useState(false);
	const [review, setReview] = useState(null);
	const [reviewError, setReviewError] = useState(null);
	const [testResults, setTestResults] = useState(null);
	const [testsLoading, setTestsLoading] = useState(false);
	const [testsError, setTestsError] = useState(null);

	const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

	useEffect(() => {
		axios
			.get(`${API_BASE}/problems/${id}`)
			.then((res) => setProblem(res.data))
			.catch((err) => console.error("Error fetching problem", err));
	}, [id]);

	const handleRun = async () => {
		setLoading(true);
		setTestResults(null);
		setTestsError(null);
		try {
			const token = localStorage.getItem("token");
			const response = await axios.post(
				`${API_BASE}/execute/`,
				{
					language,
					code,
					input_data: inputData
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setOutput(response.data);
		} catch (err) {
			setOutput({ stdout: "", stderr: "Execution Error: " + err.message, exit_code: 1 });
		}
		setLoading(false);
	};

	const handleRunTests = async () => {
		setTestsLoading(true);
		setTestsError(null);
		setTestResults(null);

		try {
			const token = localStorage.getItem("token");
			const response = await axios.post(
				`${API_BASE}/execute/tests`,
				{
					language,
					code,
					problem_id: Number(id)
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setTestResults(response.data);
		} catch (err) {
			setTestsError(err.response?.data?.detail ?? err.message);
		}

		setTestsLoading(false);
	};

	const handleAiReview = async () => {
		setReviewLoading(true);
		setReview(null);
		setReviewError(null);
		const token = localStorage.getItem("token");
		try {
			const response = await axios.post(
				`${API_BASE}/ai-review/`,
				{ code, language },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setReview(response.data);
		} catch (err) {
			setReviewError(err.response?.data?.detail ?? err.message);
		}
		setReviewLoading(false);
	};

	if (!problem) return <div className="p-10 text-center text-[var(--text-tertiary)]">Loading problem...</div>;

	return (
		<div className="flex h-[calc(100vh-64px)] w-full gap-4 p-4 bg-[var(--bg-secondary)]">
			{/* Left Side: Problem Description */}
			<div className="w-1/2 overflow-y-auto bg-[var(--bg-primary)] rounded-lg border border-[var(--border-default)] p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{problem.title}</h1>
				<div className="flex items-center gap-3 mb-4">
					<span
						className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${problem.difficulty === "Easy"
								? "bg-[var(--color-success-light)] text-[var(--color-success)]"
								: problem.difficulty === "Medium"
									? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
									: "bg-[var(--color-error-light)] text-[var(--color-error)]"
							}`}
					>
						{problem.difficulty}
					</span>
				</div>
				<hr className="mb-4 border-[var(--border-default)]" />
				<div className="prose max-w-none text-[var(--text-primary)] leading-relaxed">
					<ReactMarkdown>{problem.statement}</ReactMarkdown>
				</div>
			</div>

			{/* Right Side: Editor & Output */}
			<div className="w-1/2 flex flex-col gap-4">
				{/* Controls */}
				<div className="flex items-center justify-between bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-default)] shadow-sm">
					<select
						value={language}
						onChange={(e) => setLanguage(e.target.value)}
						className="bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm rounded-lg focus:border-[var(--border-focus)] block p-2 outline-none"
					>
						<option value="python">Python</option>
						<option value="cpp">C++</option>
						<option value="golang">Go</option>
					</select>
					<div className="flex gap-2">
						<Button
							onClick={handleRun}
							disabled={loading}
							variant="primary"
							size="small"
						>
							{loading ? "Running..." : "Run Code"}
						</Button>
						<Button
							onClick={handleRunTests}
							disabled={testsLoading}
							variant="secondary"
							size="small"
						>
							{testsLoading ? "Running Tests..." : "Run Tests"}
						</Button>
						<Button
							onClick={handleAiReview}
							disabled={reviewLoading}
							variant="ghost"
							size="small"
						>
							{reviewLoading ? "Reviewing..." : "AI Review"}
						</Button>
					</div>
				</div>

				{/* Monaco Editor */}
				<div className="flex-grow border border-[var(--border-default)] rounded-lg overflow-hidden shadow-sm">
					<Editor
						height="100%"
						language={language === "golang" ? "go" : language}
						theme="vs-dark"
						value={code}
						onChange={(value) => setCode(value)}
						options={{
							fontSize: 14,
							minimap: { enabled: false },
							fontFamily: "var(--font-family-mono)",
						}}
					/>
				</div>

				{/* Input & Output Section */}
				<div className="h-64 flex flex-col gap-4">
					<div className="flex h-full gap-4">
						<textarea
							placeholder="Input (stdin)..."
							value={inputData}
							onChange={(e) => setInputData(e.target.value)}
							className="w-1/3 p-3 text-sm font-mono border border-[var(--border-default)] rounded-lg focus:border-[var(--border-focus)] outline-none resize-none bg-[var(--bg-primary)] text-[var(--text-primary)]"
						/>
						<div className="w-2/3 bg-[#1e1e1e] rounded-lg p-3 overflow-y-auto font-mono text-sm shadow-inner text-gray-100">
							<div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Output</div>
							<pre className="text-green-400 whitespace-pre-wrap">{output.stdout}</pre>
							{output.stderr && (
								<pre className="text-red-400 whitespace-pre-wrap mt-2">{output.stderr}</pre>
							)}
						</div>
					</div>
					{/* Test Results Section */}
					{(testResults || testsError) && (
						<div className="mt-2 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg p-4 shadow-sm max-h-64 overflow-y-auto">
							<div className="flex items-center justify-between mb-2">
								<div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
									Test Cases
								</div>
								{testResults && (
									<div
										className={`px-2 py-1 rounded-full text-xs font-semibold ${testResults.all_passed
												? "bg-[var(--color-success-light)] text-[var(--color-success)]"
												: "bg-[var(--color-error-light)] text-[var(--color-error)]"
											}`}
									>
										{testResults.passed_tests}/{testResults.total_tests} Passed
									</div>
								)}
							</div>
							{testsError ? (
								<div className="p-2 bg-[var(--color-error-light)] border border-[var(--color-error)] rounded text-[var(--color-error)] text-xs">
									{testsError}
								</div>
							) : (
								<table className="w-full text-xs text-left border-collapse">
									<thead>
										<tr className="border-b border-[var(--border-default)] text-[var(--text-secondary)]">
											<th className="py-1 pr-2">#</th>
											<th className="py-1 pr-2">Input</th>
											<th className="py-1 pr-2">Expected</th>
											<th className="py-1 pr-2">Output</th>
											<th className="py-1 pr-2 text-center">Status</th>
										</tr>
									</thead>
									<tbody>
										{testResults?.results?.map((t, idx) => (
											<tr key={idx} className="border-b border-[var(--bg-tertiary)] last:border-0">
												<td className="py-1 pr-2 text-[var(--text-tertiary)]">{idx + 1}</td>
												<td className="py-1 pr-2 font-mono whitespace-pre-wrap text-[var(--text-primary)]">
													{t.input_data}
												</td>
												<td className="py-1 pr-2 font-mono text-[var(--text-primary)]">{t.expected_output}</td>
												<td className="py-1 pr-2 font-mono text-[var(--text-primary)]">{t.actual_output}</td>
												<td className="py-1 pr-2 text-center">
													<span
														className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${t.passed
																? "bg-[var(--color-success-light)] text-[var(--color-success)]"
																: "bg-[var(--color-error-light)] text-[var(--color-error)]"
															}`}
													>
														{t.passed ? "Passed" : "Failed"}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					)}
				</div>

				{/* AI Review Section */}
				{(review || reviewError) && (
					<div className="bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg p-4 shadow-sm">
						<div className="text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
							AI Code Review
							{review?.model_used && (
								<span className="ml-2 text-xs font-normal text-[var(--text-tertiary)]">({review.model_used})</span>
							)}
						</div>
						{reviewError ? (
							<div className="p-3 bg-[var(--color-error-light)] border border-[var(--color-error)] rounded text-[var(--color-error)] text-sm">
								{reviewError}
							</div>
						) : (
							<div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm max-h-48 overflow-y-auto prose max-w-none">
								<ReactMarkdown>{review?.code_review ?? ""}</ReactMarkdown>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ProblemSolve;
