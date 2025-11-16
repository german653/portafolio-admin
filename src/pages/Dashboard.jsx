import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, FolderKanban, BarChart3, Shield } from 'lucide-react';
import EditProfile from '../components/EditProfile';
import ProjectManager from '../components/ProjectManager';
import { useSupabase } from '../hooks/useSupabase';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({ projects: 0 });
  const navigate = useNavigate();
  const { getProjects } = useSupabase();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const projects = await getProjects();
    setStats({ projects: projects.length });
  };

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      try {
        await supabase.auth.signOut();
        navigate('/login');
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
      }
    }
  };

  const tabs = [
    { id: 'profile', name: 'Mi Perfil', icon: User },
    { id: 'projects', name: 'Proyectos', icon: FolderKanban },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border sticky top-0 z-40 backdrop-blur-lg bg-dark-surface/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">
                  {stats.projects} proyecto{stats.projects !== 1 ? 's' : ''}
                </span>
              </div>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-dark-surface/50 border-b border-dark-border sticky top-16 z-30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && <EditProfile />}
          {activeTab === 'projects' && <ProjectManager onUpdate={loadStats} />}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;