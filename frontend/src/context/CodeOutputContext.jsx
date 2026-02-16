import React, { createContext, useContext, useState } from 'react';

const CodeOutputContext = createContext();

export const CodeOutputProvider = ({ children }) => {
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const runCode = async (API_BASE, language, code) => {
        setLoading(true);
        setIsOpen(true);
        setOutput(null);
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
            setOutput(response.data);
        } catch (err) {
            const errorMsg = err.response?.data?.detail ?? err.message;
            setOutput({ stdout: "", stderr: `Error: ${errorMsg}`, exit_code: 1 });
        }
        setLoading(false);
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <CodeOutputContext.Provider value={{ output, loading, isOpen, setIsOpen, runCode, toggleSidebar }}>
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
