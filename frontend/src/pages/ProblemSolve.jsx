import Editor from "@monaco-editor/react";
import axios from "axios";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";

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

	useEffect(() => {
		axios
			.get(`http://localhost:8000/problems/${id}`)
			.then((res) => setProblem(res.data))
			.catch((err) => console.error("Error fetching problem", err));
	}, [id]);

	const handleRun = async () => {
		setLoading(true);
		try {
			const response = await axios.post("http://localhost:8000/execute/", {
				language,
				code,
				input_data: inputData,
			});
			setOutput(response.data);
		} catch (err) {
			setOutput({ stdout: "", stderr: "Execution Error: " + err.message, exit_code: 1 });
		}
		setLoading(false);
	};

	const handleAiReview = async () => {
		setReviewLoading(true);
		setReview(null);
		setReviewError(null);
		const token = localStorage.getItem("token");
		try {
			const response = await axios.post(
				"http://localhost:8000/ai-review/",
				{ code, language },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setReview(response.data);
		} catch (err) {
			setReviewError(err.response?.data?.detail ?? err.message);
		}
		setReviewLoading(false);
	};

	if (!problem) return <div className="p-10 text-center text-gray-500">Loading problem...</div>;

	return (
		<div className="flex h-[calc(100vh-64px)] w-full gap-2 p-2 bg-gray-50">
			{/* Left Side: Problem Description */}
			<div className="w-1/2 overflow-y-auto bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-gray-800 mb-2">{problem.title}</h1>
				<div className="flex items-center gap-3 mb-4">
					<span
						className={`px-2 py-1 rounded text-xs font-semibold ${
							problem.difficulty === "Easy"
								? "bg-green-100 text-green-700"
								: problem.difficulty === "Medium"
									? "bg-yellow-100 text-yellow-700"
									: "bg-red-100 text-red-700"
						}`}
					>
						{problem.difficulty}
					</span>
				</div>
				<hr className="mb-4" />
				<div className="prose max-w-none text-gray-700 leading-relaxed">{problem.statement}</div>
			</div>

			{/* Right Side: Editor & Output */}
			<div className="w-1/2 flex flex-col gap-2">
				{/* Controls */}
				<div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
					<select
						value={language}
						onChange={(e) => setLanguage(e.target.value)}
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
					>
						<option value="python">Python</option>
						<option value="cpp">C++</option>
						<option value="golang">Go</option>
					</select>
					<div className="flex gap-2">
						<button
							onClick={handleRun}
							disabled={loading}
							className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
								loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
							}`}
						>
							{loading ? "Running..." : "Run Code"}
						</button>
						<button
							onClick={handleAiReview}
							disabled={reviewLoading}
							className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
								reviewLoading ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
							}`}
						>
							{reviewLoading ? "Reviewing..." : "AI Review"}
						</button>
					</div>
				</div>

				{/* Monaco Editor */}
				<div className="flex-grow border border-gray-200 rounded-lg overflow-hidden shadow-sm">
					<Editor
						height="100%"
						language={language === "golang" ? "go" : language}
						theme="vs-dark"
						value={code}
						onChange={(value) => setCode(value)}
						options={{ fontSize: 14, minimap: { enabled: false } }}
					/>
				</div>

				{/* Input & Output Section */}
				<div className="h-64 flex flex-col gap-2">
					<div className="flex h-full gap-2">
						<textarea
							placeholder="Input (stdin)..."
							value={inputData}
							onChange={(e) => setInputData(e.target.value)}
							className="w-1/3 p-3 text-sm font-mono border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none"
						/>
						<div className="w-2/3 bg-gray-900 rounded-lg p-3 overflow-y-auto font-mono text-sm shadow-inner">
							<div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Output</div>
							<pre className="text-green-400 whitespace-pre-wrap">{output.stdout}</pre>
							{output.stderr && (
								<pre className="text-red-400 whitespace-pre-wrap mt-2">{output.stderr}</pre>
							)}
						</div>
					</div>
				</div>

				{/* AI Review Section */}
				{(review || reviewError) && (
					<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
						<div className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
							AI Code Review
							{review?.model_used && (
								<span className="ml-2 text-xs font-normal text-gray-500">({review.model_used})</span>
							)}
						</div>
						{reviewError ? (
							<div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
								{reviewError}
							</div>
						) : (
							<div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm max-h-48 overflow-y-auto prose prose-sm prose-slate max-w-none prose-headings:font-semibold prose-headings:text-gray-800 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-800 prose-pre:text-gray-100">
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
