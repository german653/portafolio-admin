import { useState } from 'react';
import { supabase } from '../config/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // PERFIL
  // ============================================

  // Obtener perfil
  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, no es un error crítico
        throw error;
      }
      
      setLoading(false);
      return data || null;
    } catch (err) {
      console.error('Error al obtener perfil:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  // Actualizar o crear perfil
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Primero verificamos si existe un perfil
      const { data: existingProfile, error: selectError } = await supabase
        .from('profile')
        .select('id')
        .limit(1)
        .single();

      let result;
      
      if (existingProfile && !selectError) {
        // Actualizar perfil existente
        result = await supabase
          .from('profile')
          .update({
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id)
          .select()
          .single();
      } else {
        // Crear nuevo perfil
        result = await supabase
          .from('profile')
          .insert([{
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // ============================================
  // PROYECTOS
  // ============================================

  // Obtener todos los proyectos
  const getProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setLoading(false);
      return data || [];
    } catch (err) {
      console.error('Error al obtener proyectos:', err);
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  // Subir imagen a Supabase Storage
  const uploadImage = async (file) => {
    try {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe superar los 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Error al subir imagen:', err);
      throw err;
    }
  };

  // Eliminar imagen de Supabase Storage
  const deleteImage = async (imageUrl) => {
    try {
      if (!imageUrl || !imageUrl.includes('supabase')) {
        return; // No es una imagen de Supabase
      }

      // Extraer el nombre del archivo de la URL
      const urlParts = imageUrl.split('/project-images/');
      if (urlParts.length > 1) {
        const fileName = urlParts[1].split('?')[0]; // Remover query params
        
        const { error } = await supabase.storage
          .from('project-images')
          .remove([fileName]);

        if (error) {
          console.error('Error al eliminar imagen:', error);
        }
      }
    } catch (err) {
      console.error('Error al eliminar imagen:', err);
      // No lanzamos error para no bloquear la eliminación del proyecto
    }
  };

  // Agregar proyecto
  const addProject = async (projectData, imageFile) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!imageFile) {
        throw new Error('Debes seleccionar una imagen para el proyecto');
      }

      // Subir imagen
      const imageUrl = await uploadImage(imageFile);

      const { error } = await supabase
        .from('projects')
        .insert([{
          title: projectData.title,
          description: projectData.description,
          image: imageUrl,
          demo_url: projectData.demoUrl, // Aquí está el cambio: demo_url
          tags: projectData.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error al agregar proyecto:', err);
      setError(err.message);
      setLoading(false);
      alert(`Error: ${err.message}`);
      return false;
    }
  };

  // Actualizar proyecto
  const updateProject = async (projectId, projectData, imageFile) => {
    try {
      setLoading(true);
      setError(null);
      
      let imageUrl = projectData.image;
      
      // Subir nueva imagen si existe
      if (imageFile) {
        // Eliminar imagen anterior si existe
        if (projectData.image) {
          await deleteImage(projectData.image);
        }
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('projects')
        .update({
          title: projectData.title,
          description: projectData.description,
          image: imageUrl,
          demo_url: projectData.demoUrl, // Aquí está el cambio: demo_url
          tags: projectData.tags || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error al actualizar proyecto:', err);
      setError(err.message);
      setLoading(false);
      alert(`Error: ${err.message}`);
      return false;
    }
  };

  // Eliminar proyecto
  const deleteProject = async (projectId, imageUrl) => {
    try {
      setLoading(true);
      setError(null);
      
      // Eliminar imagen si existe
      if (imageUrl) {
        await deleteImage(imageUrl);
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error al eliminar proyecto:', err);
      setError(err.message);
      setLoading(false);
      alert(`Error: ${err.message}`);
      return false;
    }
  };

  return {
    loading,
    error,
    getProfile,
    updateProfile,
    getProjects,
    addProject,
    updateProject,
    deleteProject,
  };
};