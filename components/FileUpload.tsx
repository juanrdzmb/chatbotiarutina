import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from './Button';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFileSelect: (file: UploadedFile) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      setError("Formato no soportado. Por favor sube PDF, JPG o PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("El archivo es demasiado grande. Máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove Data URL prefix for raw base64 if needed, but Gemini SDK often takes base64. 
      // The @google/genai SDK expects raw base64 string for inlineData.
      const base64Data = result.split(',')[1];
      
      onFileSelect({
        data: base64Data,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.onerror = () => setError("Error al leer el archivo.");
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Analiza tu Rutina</h2>
        <p className="text-gray-400">Sube tu plan de entrenamiento (PDF o Imagen) y deja que la IA lo optimice para ti.</p>
      </div>

      <div 
        className={`relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer
          ${dragActive ? "border-brand-500 bg-brand-500/10" : "border-gray-700 hover:border-brand-500/50 hover:bg-dark-800"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          onChange={handleChange}
          accept=".pdf,image/png,image/jpeg,image/webp"
        />
        
        <div className="mb-4 p-4 rounded-full bg-dark-800 group-hover:bg-dark-700 transition-colors shadow-xl">
          <Upload className={`w-8 h-8 ${dragActive ? 'text-brand-400' : 'text-gray-400'}`} />
        </div>

        <h3 className="text-xl font-semibold text-gray-200 mb-2">
          Arrastra tu archivo aquí
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Soporta PDF, PNG, JPG (Max 5MB)
        </p>

        <Button className="pointer-events-none">
          Seleccionar Archivo
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-dark-800/50 p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <ImageIcon className="text-brand-500 w-5 h-5" />
          <span className="text-sm text-gray-300">Capturas de Pantalla</span>
        </div>
        <div className="bg-dark-800/50 p-4 rounded-xl border border-gray-800 flex items-center gap-3">
          <FileText className="text-brand-500 w-5 h-5" />
          <span className="text-sm text-gray-300">Archivos PDF</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
