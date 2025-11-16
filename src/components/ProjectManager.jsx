import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

const ProjectManager = ({ onUpdate }) => {
  const { getProjects, addProject, updateProject, deleteProject, loading } = useSupabase();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    demoUrl: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const projectsData = await getProjects();
    setProjects(projectsData);
    if (onUpdate) onUpdate();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        image: project.image,
        demoUrl: project.demoUrl,
        tags: project.tags || [],
      });
      setImagePreview(project.image);
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        demoUrl: '',
        tags: [],
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      demoUrl: '',
      tags: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile && !formData.image) {
      alert('Debes seleccionar una imagen para el proyecto');
      return;
    }

    let success = false;

    if (editingProject) {
      success = await updateProject(editingProject.id, formData, imageFile);
    } else {
      success = await addProject(formData, imageFile);
    }

    if (success) {
      await loadProjects();
      handleCloseModal();
    }
  };

  const handleDelete = async (projectId, imageUrl) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      const success = await deleteProject(projectId, imageUrl);
      if (success) {
        await loadProjects();
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Proyectos</h2>
          <p className="text-gray-400 text-sm mt-1">Administra tu portafolio de proyectos</p>
        </div>
        <motion.button
          onClick={() => handleOpenModal()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proyecto
        </motion.button>
      </div>

      {/* Lista de Proyectos */}
      {projects.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No hay proyectos</h3>
          <p className="text-gray-400 mb-6">Comienza agregando tu primer proyecto</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
          >
            Crear Proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent opacity-80"></div>
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 p-2 bg-dark-surface/80 backdrop-blur-sm border border-dark-border rounded-lg text-white hover:bg-purple-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags?.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags?.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleOpenModal(project)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-3 py-2 bg-blue-500/10 border border-blue-500/50 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(project.id, project.image)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-surface border border-dark-border rounded-2xl p-6 max-w-2xl w-full my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título del Proyecto *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Ej: E-Commerce Platform"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    placeholder="Describe las características y funcionalidades principales de tu proyecto..."
                    required
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Imagen del Proyecto * {editingProject && '(Deja vacío para mantener la actual)'}
                  </label>
                  <label className="w-full px-4 py-3 bg-dark-bg border border-dashed border-dark-border hover:border-purple-500 rounded-lg text-gray-400 transition-all cursor-pointer flex items-center justify-center gap-2 group">
                    <Upload className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                    <span className="group-hover:text-purple-400 transition-colors">
                      {imageFile ? imageFile.name : 'Seleccionar imagen (máx 5MB)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="mt-4 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* URL Demo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL de Demo *
                  </label>
                  <input
                    type="url"
                    name="demoUrl"
                    value={formData.demoUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="https://tu-proyecto.com"
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tecnologías Utilizadas
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Ej: React, Node.js, MongoDB..."
                    />
                    <motion.button
                      type="button"
                      onClick={handleAddTag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-300 flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4 border-t border-dark-border">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : editingProject ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleCloseModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-dark-bg border border-dark-border rounded-lg text-white hover:bg-dark-surface transition-colors"
                  >
                    Cancelar
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectManager;