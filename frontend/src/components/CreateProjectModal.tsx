import React, { useState, useRef } from 'react';
import { projectsAPI } from '../services/api';
import { Project } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Project) => void;
}

const CreateProjectModal: React.FC<Props> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (loading) {
      console.log('🚫 Already creating project, ignoring duplicate submit');
      return;
    }
    
    // Prevent rapid double submissions
    if (submitTimeoutRef.current) {
      console.log('🚫 Submit blocked - too fast');
      return;
    }
    
    try {
      console.log('🆕 Frontend: Creating project:', name);
      setLoading(true);
      setError('');
      
      // Set timeout to prevent rapid resubmissions
      submitTimeoutRef.current = setTimeout(() => {
        submitTimeoutRef.current = null;
      }, 2000);
      
      const res = await projectsAPI.create({ name, description });
      console.log('✅ Frontend: Project creation response:', res.data);
      if (res.data.success) {
        onCreate(res.data.data!);
        setName('');
        setDescription('');
        onClose(); // Close modal on success
      } else {
        setError(res.data.error || 'Failed to create project');
      }
    } catch (err: any) {
      console.error('❌ Frontend: Project creation error:', err);
      setError(err.response?.data?.error || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;