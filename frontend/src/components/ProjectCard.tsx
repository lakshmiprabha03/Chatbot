import React from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { Project } from '../types';

interface Props {
  project: Project;
  onDelete: () => void;  // Callback to refresh projects list
  className?: string;    // ✅ allow external styles
}

const ProjectCard: React.FC<Props> = ({ project, onDelete, className }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}"?`)) return;
    try {
      const res = await projectsAPI.delete(project._id);
      if (res.data.success) {
        onDelete(); // Refresh dashboard list
      }
    } catch (err: any) {
      console.error(
        'Delete failed:',
        err.response?.data?.error || 'Error deleting project'
      );
      alert('Failed to delete project');
    }
  };

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition hover:shadow-md ${className || ''}`}
    >
      {/* Project Title */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {project.name}
      </h3>

      {/* Description (if exists) */}
      {project.description && (
        <p className="text-gray-600 mb-4">{project.description}</p>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(`/chat/${project._id}`)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm"
        >
          Chat
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm shadow-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
