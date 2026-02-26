import React, { createContext, useContext, useState } from 'react';

const CodeOutputContext = createContext();

export const CodeOutputProvider = ({ children }) => {
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [metadata, setMetadata] = useState(null);

    const runCode = async (API_BASE, language, code, meta = null) => {
        setLoading(true);
        setIsOpen(true);
        setOutput(null);
        setMetadata(meta);
        try {
            const token = localStorage.getItem("token");
            const axios = (await import("axios")).default;
            const response = await axios.post(
                `${API_BASE}/execute/`,
                {
                    language,
                    code,
                    input_data: ""
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOutput({ ...response.data, code, language });
        } catch (err) {
            const errorMsg = err.response?.data?.detail ?? err.message;
            setOutput({ stdout: "", stderr: `Error: ${errorMsg}`, exit_code: 1 });
        }
        setLoading(false);
    };

    const runAiTests = async (API_BASE, language, code, problemDescription, meta = null) => {
        setLoading(true);
        setIsOpen(true);
        setOutput(null);
        setMetadata(meta);
        try {
            const token = localStorage.getItem("token");
            const axios = (await import("axios")).default;
            const response = await axios.post(
                `${API_BASE}/execute/ai-tests`,
                {
                    language,
                    code,
                    problem_description: problemDescription
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Prefixing with type so the sidebar knows how to render it
            setOutput({ ...response.data, type: 'ai-tests', code, language });
        } catch (err) {
            const errorMsg = err.response?.data?.detail ?? err.message;
            setOutput({
                results: [],
                summary: `Error: ${errorMsg}`,
                type: 'ai-tests'
            });
        }
        setLoading(false);
    };

    const saveAttempt = async (API_BASE, attemptData) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const axios = (await import("axios")).default;
            const response = await axios.post(
                `${API_BASE}/api/attempts/`,
                attemptData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (err) {
            console.error("Failed to save attempt:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <CodeOutputContext.Provider value={{ output, loading, isOpen, setIsOpen, metadata, runCode, runAiTests, saveAttempt, toggleSidebar }}>
            {children}
        </CodeOutputContext.Provider>
    );
};

export const useCodeOutput = () => {
    const context = useContext(CodeOutputContext);
    if (!context) {
        throw new Error('useCodeOutput must be used within a CodeOutputProvider');
    }
    return context;
};
