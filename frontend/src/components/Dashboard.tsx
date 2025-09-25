import CreateProjectModal from './CreateProjectModal';
import ProjectCard from './ProjectCard';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../services/api';
import { Project } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.getAll();
      if (res.data.success) {
        setProjects(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setShowModal(false);
  };

  // ✅ Loading Spinner (centered)
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-6 w-6 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span className="text-green-600 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* ✅ Header centered in card */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard - Welcome, {user?.username || 'User '}
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm"
            >
              Create Project
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ✅ Empty State Centered */}
        {projects.length === 0 ? (
          <div className="flex justify-center">
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-md">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-4">
                No projects yet. Create one to start chatting!
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Get Started
              </button>
            </div>
          </div>
        ) : (
          // ✅ Center grid items
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={fetchProjects}
                className="w-full max-w-sm"
              />
            ))}
          </div>
        )}

        <CreateProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateProject}
        />
      </div>
    </div>
  );
};

export default Dashboard;
