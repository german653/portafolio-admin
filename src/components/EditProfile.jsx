import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, X, CheckCircle } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

const EditProfile = () => {
  const { getProfile, updateProfile, loading } = useSupabase();
  const [profileData, setProfileData] = useState({
    name: '',
    role: '',
    description: '',
    services: [],
    skills: [],
    whatsapp: '',
    instagram: '',
    email: '',
  });
  const [profileId, setProfileId] = useState(null);
  const [newService, setNewService] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profile = await getProfile();
    if (profile) {
      setProfileData(profile);
      setProfileId(profile.id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setProfileData((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService('');
    }
  };

  const handleRemoveService = (index) => {
    setProfileData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;

    if (profileId) {
      success = await updateProfile(profileId, profileData);
    } else {
      success = await createProfile(profileData);
      if (success) {
        const profile = await getProfile();
        if (profile) setProfileId(profile.id);
      }
    }

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Información Personal</h2>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Guardado</span>
            </motion.div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre y Rol */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Tu Nombre"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rol / Título *
              </label>
              <input
                type="text"
                name="role"
                value={profileData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Desarrollador Web Full Stack"
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción / Bio *
            </label>
            <textarea
              name="description"
              value={profileData.description}
              onChange={handleInputChange}
              rows="5"
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              placeholder="Cuéntanos sobre ti, tu experiencia y pasión por el desarrollo..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta descripción aparecerá en la sección "Sobre Mí" de tu portafolio
            </p>
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Servicios que Ofreces
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                className="flex-1 px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Ej: Desarrollo de aplicaciones web personalizadas"
              />
              <motion.button
                type="button"
                onClick={handleAddService}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.services.map((service, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-300 flex items-center gap-2"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.span>
              ))}
            </div>
          </div>

          {/* Habilidades */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tecnologías / Habilidades
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Ej: React, Node.js, Python..."
              />
              <motion.button
                type="button"
                onClick={handleAddSkill}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-300 flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.span>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  WhatsApp
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={profileData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="+5493513427543"
                />
                <p className="text-xs text-gray-500 mt-1">Incluye código de país</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={profileData.instagram}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="@tu_usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex items-center gap-4 pt-4 border-t border-dark-border">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditProfile;