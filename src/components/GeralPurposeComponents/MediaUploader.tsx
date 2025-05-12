import { FC, useState, ChangeEvent } from 'react';
import { FaUpload, FaSpinner, FaYoutube, FaImage, FaFilm, FaCheck } from 'react-icons/fa';
import { connectionUrl } from '../../config/connection';
import Swal from 'sweetalert2';

interface MediaUploaderProps {
  exercicioId: number;
  onMediaUploaded: (mediaType: 'image' | 'video' | 'gif', url: string) => void;
  currentImage?: string;
  currentVideo?: string;
  currentGif?: string;
}

const MediaUploader: FC<MediaUploaderProps> = ({ 
  exercicioId, 
  onMediaUploaded, 
  currentImage, 
  currentVideo, 
  currentGif 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'gif'>('image');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadSuccess(null);

    try {
      // Verificar o tipo de arquivo
      let type: 'image' | 'video' | 'gif' = 'image';
      
      if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type === 'image/gif') {
        type = 'gif';
      }

      console.log(`Iniciando upload de ${type} para o exercício ID: ${exercicioId}`);
      console.log(`Tipo do arquivo: ${file.type}, Tamanho: ${file.size} bytes`);

      // Verificar se temos um ID de exercício válido
      if (!exercicioId || exercicioId <= 0) {
        throw new Error('ID de exercício inválido. Salve o exercício primeiro.');
      }

      // Criar FormData para envio
      const formData = new FormData();
      formData.append('media', file);
      formData.append('exercicioId', exercicioId.toString());
      formData.append('tipo', type);

      // Obter token de autenticação
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log(`Enviando requisição para ${connectionUrl}/upload/exercise-media`);
      
      // Enviar arquivo para o backend
      const response = await fetch(`${connectionUrl}/upload/exercise-media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao fazer upload do arquivo');
      }

      const data = await response.json();
      console.log('Resposta do servidor:', data);
      
      // Notificar o componente pai sobre o upload bem-sucedido
      onMediaUploaded(type, data.url);
      
      // Mostrar mensagem de sucesso
      setUploadSuccess(`${type} enviado com sucesso!`);
      
      // Limpar campo de arquivo
      e.target.value = '';
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro no Upload',
        text: error instanceof Error ? error.message : 'Erro desconhecido ao fazer upload',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'URL vazia',
        text: 'Por favor, insira uma URL do YouTube válida',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    setIsUploading(true);
    setUploadSuccess(null);

    try {
      // Verificar se temos um ID de exercício válido
      if (!exercicioId || exercicioId <= 0) {
        throw new Error('ID de exercício inválido. Salve o exercício primeiro.');
      }

      // Extrair o ID do vídeo do YouTube da URL
      let videoId = '';
      const url = new URL(youtubeUrl);
      
      if (url.hostname === 'youtu.be') {
        videoId = url.pathname.substring(1);
      } else if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v') || '';
      }

      if (!videoId) {
        throw new Error('URL do YouTube inválida. Use um formato como: https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID');
      }

      // Criar URL de incorporação
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      // Obter token de autenticação
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Enviar URL para o backend
      const response = await fetch(`${connectionUrl}/exercicios/${exercicioId}/youtube-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoUrl: embedUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar URL do YouTube');
      }

      const data = await response.json();
      console.log('Resposta do servidor:', data);
      
      // Notificar o componente pai sobre o upload bem-sucedido
      onMediaUploaded('video', embedUrl);
      
      // Mostrar mensagem de sucesso
      setUploadSuccess('Vídeo do YouTube adicionado com sucesso!');
      
      // Limpar campo de URL
      setYoutubeUrl('');
    } catch (error) {
      console.error('Erro ao adicionar vídeo do YouTube:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao adicionar vídeo',
        text: error instanceof Error ? error.message : 'Erro desconhecido ao adicionar vídeo do YouTube',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4 border rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium text-gray-700 mb-3">Adicionar Mídia ao Exercício</h3>
      
      {/* Seleção de tipo de mídia */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => {
            setMediaType('image');
            setShowYoutubeInput(false);
            setUploadSuccess(null);
          }}
          className={`px-3 py-2 rounded-md flex items-center whitespace-nowrap ${
            mediaType === 'image' && !showYoutubeInput ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FaImage className="mr-2" /> Imagem
        </button>
        <button
          type="button"
          onClick={() => {
            setMediaType('video');
            setShowYoutubeInput(false);
            setUploadSuccess(null);
          }}
          className={`px-3 py-2 rounded-md flex items-center whitespace-nowrap ${
            mediaType === 'video' && !showYoutubeInput ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FaFilm className="mr-2" /> Vídeo
        </button>
        <button
          type="button"
          onClick={() => {
            setMediaType('gif');
            setShowYoutubeInput(false);
            setUploadSuccess(null);
          }}
          className={`px-3 py-2 rounded-md flex items-center whitespace-nowrap ${
            mediaType === 'gif' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          GIF
        </button>
        <button
          type="button"
          onClick={() => {
            setMediaType('video');
            setShowYoutubeInput(true);
            setUploadSuccess(null);
          }}
          className={`px-3 py-2 rounded-md flex items-center whitespace-nowrap ${
            showYoutubeInput ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FaYoutube className="mr-2" /> YouTube
        </button>
      </div>
      
      {/* Input para URL do YouTube */}
      {showYoutubeInput && (
        <div className="mb-4">
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Cole a URL do vídeo do YouTube aqui"
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={handleYoutubeSubmit}
              disabled={isUploading || !youtubeUrl}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            >
              {isUploading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaYoutube className="mr-2" />
              )}
              Adicionar Vídeo
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Formatos aceitos: https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID
          </p>
        </div>
      )}

      {/* Área de upload de arquivo */}
      {!showYoutubeInput && (
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            accept={
              mediaType === 'image' ? 'image/jpeg,image/png,image/webp' :
              mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' :
              'image/gif'
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <FaSpinner className="animate-spin text-blue-600 text-2xl mb-2" />
                <p className="text-gray-600">Enviando arquivo...</p>
              </div>
            ) : uploadSuccess ? (
              <div className="flex flex-col items-center">
                <FaCheck className="text-green-500 text-2xl mb-2" />
                <p className="text-green-600">{uploadSuccess}</p>
                <p className="text-sm text-gray-500 mt-2">Clique novamente para substituir</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FaUpload className="text-gray-400 text-2xl mb-2" />
                <p className="text-gray-600">
                  Clique para selecionar um {
                    mediaType === 'image' ? 'arquivo de imagem' :
                    mediaType === 'video' ? 'arquivo de vídeo' : 'GIF'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {mediaType === 'image' ? 'JPG, PNG ou WebP' :
                   mediaType === 'video' ? 'MP4, WebM ou MOV' : 'Apenas GIF'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Visualização das mídias atuais */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentImage && (
          <div className="border rounded-md p-2">
            <p className="text-xs text-gray-500 mb-1">Imagem Atual</p>
            <img 
              src={currentImage} 
              alt="Imagem do exercício" 
              className="w-full h-32 object-cover rounded"
            />
          </div>
        )}
        
        {currentVideo && (
          <div className="border rounded-md p-2">
            <p className="text-xs text-gray-500 mb-1">Vídeo Atual</p>
            {currentVideo.includes('youtube.com/embed/') ? (
              <iframe
                src={currentVideo}
                className="w-full h-32 rounded"
                allowFullScreen
                title="Vídeo do exercício"
              ></iframe>
            ) : (
              <video 
                src={currentVideo} 
                controls 
                className="w-full h-32 object-cover rounded"
              />
            )}
          </div>
        )}
        
        {currentGif && (
          <div className="border rounded-md p-2">
            <p className="text-xs text-gray-500 mb-1">GIF Atual</p>
            <img 
              src={currentGif} 
              alt="GIF do exercício" 
              className="w-full h-32 object-cover rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploader; 
