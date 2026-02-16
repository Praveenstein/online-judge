import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const Layout = ({ onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
            navigate('/');
        }
    };

    return (
        <div className="flex min-h-screen bg-[var(--bg-primary)]">
            {/* Sidebar */}
            <aside className="sidebar flex flex-col justify-between">
                <div>
                    <div className="px-4 py-6 mb-6">
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">DSA Journal</h1>
                    </div>

                    <nav className="space-y-1">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `block px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                }`
                            }
                            end
                        >
                            Problems
                        </NavLink>
                        <NavLink
                            to="/notes"
                            className={({ isActive }) =>
                                `block px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                }`
                            }
                        >
                            Notes
                        </NavLink>
                        <NavLink
                            to="/diagram"
                            className={({ isActive }) =>
                                `block px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                }`
                            }
                        >
                            Diagrams
                        </NavLink>
                    </nav>
                </div>

                <div className="mt-auto pt-6 border-t border-[var(--border-default)]">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)] rounded-md transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content flex-1">
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
