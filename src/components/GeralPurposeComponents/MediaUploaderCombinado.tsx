import { FC, useState, ChangeEvent } from 'react';
import { FaUpload, FaYoutube, FaImage, FaFilm, FaCheck } from 'react-icons/fa';

interface MediaUploaderCombinadoProps {
  onMediaSelected: (mediaFile: File | null, mediaType: 'image' | 'video' | 'gif', youtubeUrl: string) => void;
}

const MediaUploaderCombinado: FC<MediaUploaderCombinadoProps> = ({ onMediaSelected }) => {
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'gif'>('image');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadSuccess(`Arquivo ${file.name} selecionado`);
    
    // Criar URL de visualização para o arquivo
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Notificar o componente pai sobre o arquivo selecionado
    onMediaSelected(file, mediaType, '');
    
    // Limpar campo de YouTube se estiver preenchido
    if (youtubeUrl) {
      setYoutubeUrl('');
    }
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    
    // Extrair e formatar a URL do YouTube para incorporação
    if (url) {
      try {
        let videoId = '';
        const urlObj = new URL(url);
        
        if (urlObj.hostname === 'youtu.be') {
          videoId = urlObj.pathname.substring(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
          videoId = urlObj.searchParams.get('v') || '';
        }
        
        if (videoId) {
          const embedUrl = `https://www.youtube.com/embed/${videoId}`;
          // Notificar o componente pai sobre a URL do YouTube
          onMediaSelected(null, 'video', embedUrl);
          setUploadSuccess('URL do YouTube válida');
        } else {
          setUploadSuccess(null);
        }
      } catch {
        // URL inválida, ignorar
        setUploadSuccess(null);
      }
    } else {
      setUploadSuccess(null);
      // Notificar o componente pai para limpar a URL
      onMediaSelected(null, 'video', '');
    }
  };

  const handleMediaTypeChange = (type: 'image' | 'video' | 'gif', isYoutube: boolean = false) => {
    setMediaType(type);
    setShowYoutubeInput(isYoutube);
    setUploadSuccess(null);
    setPreviewUrl(null);
    
    // Limpar seleção atual
    if (isYoutube) {
      onMediaSelected(null, type, youtubeUrl || '');
    } else {
      onMediaSelected(null, type, '');
      setYoutubeUrl('');
    }
  };

  return (
    <div className="mt-4 border rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium text-gray-700 mb-3">Adicionar Mídia ao Exercício</h3>
      
      {/* Seleção de tipo de mídia */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => handleMediaTypeChange('image')}
          className={`px-3 py-2 rounded-md flex items-center whitespace-nowrap ${
            mediaType === 'image' && !showYoutubeInput ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FaImage className="mr-2" /> Imagem
        </button>
        <button
          type="button"
          onClick={() => handleMediaTypeChange('video')}
          className={`px-3 py-2 rounded-md flex items-center whitespace-nowrap ${
            mediaType === 'video' && !showYoutubeInput ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FaFilm className="mr-2" /> Vídeo
        </button>
        <button
          type="button"
          onClick={() => handleMediaTypeChange('gif')}
          className={`px-3 py-2 rounded-md flex items-center whitespace-nowrap ${
            mediaType === 'gif' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          GIF
        </button>
        <button
          type="button"
          onClick={() => handleMediaTypeChange('video', true)}
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
              onChange={handleYoutubeUrlChange}
              placeholder="Cole a URL do vídeo do YouTube aqui"
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
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
            onChange={handleFileSelect}
            accept={
              mediaType === 'image' ? 'image/jpeg,image/png,image/webp' :
              mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' :
              'image/gif'
            }
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {uploadSuccess ? (
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
      
      {/* Visualização da mídia selecionada */}
      {previewUrl && !showYoutubeInput && (
        <div className="mt-4 border rounded-md p-2">
          <p className="text-xs text-gray-500 mb-1">Prévia</p>
          {mediaType === 'image' || mediaType === 'gif' ? (
            <img 
              src={previewUrl} 
              alt="Prévia da mídia" 
              className="w-full h-32 object-cover rounded"
            />
          ) : (
            <video 
              src={previewUrl} 
              controls 
              className="w-full h-32 object-cover rounded"
            />
          )}
        </div>
      )}
      
      {/* Visualização do vídeo do YouTube */}
      {showYoutubeInput && youtubeUrl && uploadSuccess && (
        <div className="mt-4 border rounded-md p-2">
          <p className="text-xs text-gray-500 mb-1">Prévia do YouTube</p>
          <div className="relative pt-[56.25%]">
            <iframe
              className="absolute inset-0 w-full h-full rounded"
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

// Função auxiliar para extrair o ID do vídeo do YouTube
function getYoutubeVideoId(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.substring(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v') || '';
    }
    return '';
  } catch {
    return '';
  }
}

export default MediaUploaderCombinado; 