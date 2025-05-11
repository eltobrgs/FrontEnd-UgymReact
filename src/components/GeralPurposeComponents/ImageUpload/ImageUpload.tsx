import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { FaCamera, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { connectionUrl } from '../../../config/connection';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  endpoint: string;
  currentImageUrl?: string;
  className?: string;
  temporaryToken?: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  endpoint, 
  currentImageUrl,
  className = '',
  temporaryToken
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Log para depuração
  console.log('ImageUpload - currentImageUrl recebida:', currentImageUrl);
  
  // Atualizar o preview quando a URL da imagem atual mudar
  useEffect(() => {
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
      console.log('ImageUpload - previewUrl atualizado com:', currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/i)) {
      setError('Formato de imagem não suportado. Use JPEG, PNG, GIF ou WebP.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    setIsUploading(true);
    setError(null);

    try {
      // Usar token temporário se disponível, caso contrário usar o token normal
      const token = temporaryToken || localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      console.log(`Iniciando upload para endpoint: ${endpoint}`);
      console.log(`Token utilizado (primeiros 15 caracteres): ${token.substring(0, 15)}...`);
      
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${connectionUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log(`Status da resposta: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro detalhado:', errorData);
        throw new Error(errorData.error || 'Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      console.log('Resposta do servidor:', data);
      
      if (!data.avatarUrl) {
        throw new Error('URL da imagem não retornada pelo servidor');
      }

      onImageUploaded(data.avatarUrl);
    } catch (err) {
      console.error('Erro no upload:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      // Manter o preview mesmo com erro para o usuário poder tentar novamente
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        onClick={triggerFileInput}
        className={`
          w-32 h-32 rounded-full overflow-hidden border-2 cursor-pointer
          ${previewUrl ? 'border-gray-300' : 'border-dashed border-gray-400'}
          ${isUploading ? 'opacity-70' : 'hover:border-red-500'}
          flex items-center justify-center bg-gray-100 transition-all
        `}
      >
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <FaCamera size={32} className="text-gray-400" />
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <FaSpinner className="text-white animate-spin" size={24} />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />

      {error && (
        <div className="absolute mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 flex items-center">
          <FaExclamationTriangle className="mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 