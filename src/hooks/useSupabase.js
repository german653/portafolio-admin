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
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();

      if (error) throw error;
      
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Error al obtener perfil:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      
      // Primero verificamos si existe un perfil
      const { data: existingProfile } = await supabase
        .from('profile')
        .select('id')
        .single();

      let result;
      if (existingProfile) {
        // Actualizar
        result = await supabase
          .from('profile')
          .update(profileData)
          .eq('id', existingProfile.id);
      } else {
        // Insertar nuevo
        result = await supabase
          .from('profile')
          .insert([profileData]);
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

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
      // Extraer el path de la URL
      const urlParts = imageUrl.split('/project-images/');
      if (urlParts.length > 1) {
        const filePath = `projects/${urlParts[1]}`;
        
        const { error } = await supabase.storage
          .from('project-images')
          .remove([filePath]);

        if (error) throw error;
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
      
      let imageUrl = projectData.image;
      
      // Subir imagen si existe
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          image: imageUrl,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error al agregar proyecto:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Actualizar proyecto
  const updateProject = async (projectId, projectData, imageFile) => {
    try {
      setLoading(true);
      
      let imageUrl = projectData.image;
      
      // Subir nueva imagen si existe
      if (imageFile) {
        // Eliminar imagen anterior si existe
        if (projectData.image && projectData.image.includes('supabase')) {
          await deleteImage(projectData.image);
        }
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('projects')
        .update({
          ...projectData,
          image: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error al actualizar proyecto:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Eliminar proyecto
  const deleteProject = async (projectId, imageUrl) => {
    try {
      setLoading(true);
      
      // Eliminar imagen si existe
      if (imageUrl && imageUrl.includes('supabase')) {
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