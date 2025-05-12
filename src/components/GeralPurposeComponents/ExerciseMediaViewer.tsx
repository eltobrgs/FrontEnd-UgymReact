import { FC, useState } from 'react';
import { FaImage, FaPlayCircle, FaTimes, FaYoutube } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface ExerciseMediaViewerProps {
  image?: string;
  video?: string;
  gif?: string;
  name: string;
}

const ExerciseMediaViewer: FC<ExerciseMediaViewerProps> = ({ image, video, gif, name }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'gif'>(
    image ? 'image' : gif ? 'gif' : 'image'
  );
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Verificar se há mídias disponíveis
  const hasImage = !!image;
  const hasVideo = !!video;
  const hasGif = !!gif;
  const isYoutubeVideo = video?.includes('youtube.com/embed/');

  // Se não houver nenhuma mídia, mostrar mensagem
  if (!hasImage && !hasVideo && !hasGif) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-lg">
        <FaImage className="text-gray-400 text-3xl mb-2" />
        <p className="text-gray-500">Nenhuma mídia disponível para este exercício</p>
      </div>
    );
  }

  // Modal de vídeo
  const VideoModal = () => (
    <AnimatePresence>
      {showVideoModal && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="fixed inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideoModal(false)}
          />
          
          <motion.div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto z-10 relative m-4 overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
          >
            <div className="relative">
              <div className="p-4 bg-gradient-to-r from-red-600 to-red-500 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  {isYoutubeVideo ? (
                    <FaYoutube size={24} className="mr-2" />
                  ) : (
                    <FaPlayCircle size={20} className="mr-2" />
                  )}
                  Vídeo Demonstrativo: {name}
                </h3>
                <button 
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  onClick={() => setShowVideoModal(false)}
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="p-4">
                {video && isYoutubeVideo ? (
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={video}
                      title={`Vídeo do exercício ${name}`}
                      className="w-full h-[60vh]"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <video 
                      src={video} 
                      controls 
                      className="max-h-[60vh] rounded-lg shadow-lg"
                      poster={image}
                    >
                      Seu navegador não suporta a reprodução de vídeos.
                    </video>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Abas para imagem e GIF */}
      {(hasImage || hasGif) && (
        <div>
          {/* Tabs de navegação */}
          <div className="flex border-b bg-gray-50">
            {hasImage && (
              <button
                className={`flex-1 flex items-center justify-center px-4 py-3 ${
                  activeTab === 'image' 
                    ? 'bg-white text-red-600 border-b-2 border-red-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('image')}
              >
                <FaImage className="mr-2" /> Imagem
              </button>
            )}
            {hasGif && (
              <button
                className={`flex-1 flex items-center justify-center px-4 py-3 ${
                  activeTab === 'gif' 
                    ? 'bg-white text-red-600 border-b-2 border-red-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('gif')}
              >
                <FaPlayCircle className="mr-2" /> GIF
              </button>
            )}
          </div>

          {/* Conteúdo da mídia */}
          <div className="relative">
            {activeTab === 'image' && hasImage && (
              <motion.img 
                key="image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={image} 
                alt={`Imagem do exercício ${name}`} 
                className="w-full h-auto object-contain max-h-96"
              />
            )}
            
            {activeTab === 'gif' && hasGif && (
              <motion.img 
                key="gif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={gif} 
                alt={`GIF do exercício ${name}`} 
                className="w-full h-auto object-contain max-h-96"
              />
            )}
          </div>
        </div>
      )}

      {/* Botão para vídeo */}
      {hasVideo && (
        <div className={`${(hasImage || hasGif) ? 'mt-4' : ''}`}>
          <button
            onClick={() => setShowVideoModal(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center font-medium"
          >
            {isYoutubeVideo ? (
              <FaYoutube className="mr-2 text-xl" />
            ) : (
              <FaPlayCircle className="mr-2 text-xl" />
            )}
            Ver Vídeo Demonstrativo
          </button>
        </div>
      )}

      {/* Modal de vídeo */}
      <VideoModal />
    </div>
  );
};

export default ExerciseMediaViewer; 