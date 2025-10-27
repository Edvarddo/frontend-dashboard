import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

const useFileHandling = ({
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFileTypes = {
    images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    documents: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    others: [
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  }
} = {}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const { toast } = useToast();

  const allAllowedTypes = Object.values(allowedFileTypes).flat();

  const validateFile = useCallback((file) => {
    if (!allAllowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no permitido",
        description: `El archivo ${file.name} no es un tipo válido.`,
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxFileSize) {
      toast({
        title: "Archivo muy grande",
        description: `El archivo ${file.name} excede el límite de ${maxFileSize / (1024 * 1024)}MB.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [allAllowedTypes, maxFileSize, toast]);

  const addFiles = useCallback((newFiles) => {
    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: "Límite de archivos excedido",
        description: `Solo puedes subir un máximo de ${maxFiles} archivos.`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = Array.from(newFiles).filter(validateFile);

    const fileObjects = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));

    setFiles((prevFiles) => [...prevFiles, ...fileObjects]);
  }, [files.length, maxFiles, toast, validateFile]);

  const removeFile = useCallback((fileId) => {
    setFiles((prevFiles) => {
      const fileToRemove = prevFiles.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter((f) => f.id !== fileId);
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleFileChange = (e) => {
    addFiles(e.target.files);
  };

  const resetFiles = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setUploadProgress({});
  };

  return {
    files,
    isDragging,
    uploadProgress,
    setUploadProgress,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    resetFiles,
  };
};

export default useFileHandling;