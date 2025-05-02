import React from 'react';
import { FaTimes, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaGraduationCap, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  personal: {
    id: number;
    name: string;
    cref: string;
    yearsOfExperience: string;
    workLocation: string;
    pricePerHour: string;
    specializations: string[];
    imageUrl: string;
    education: string[];
    certifications: string[];
    biography: string;
    availableTimes: string[];
    contactInfo: {
      email?: string;
      phone?: string;
    };
  };
}

const PersonalDetailModal: React.FC<PersonalDetailModalProps> = ({ isOpen, onClose, personal }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="fixed inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com imagem e botão de fechar */}
            <div className="relative">
              <img 
                src={personal.imageUrl} 
                alt={personal.name} 
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <motion.button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-red-600 p-2 rounded-full hover:bg-red-700 text-white shadow-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes size={18} />
              </motion.button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h2 className="text-2xl font-bold text-white">{personal.name}</h2>
              </div>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Informações Básicas</h3>

                <div className="space-y-3">
                  <motion.div 
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <FaGraduationCap className="mr-3 text-red-600" />
                    <span className="font-medium">CREF: {personal.cref}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FaBriefcase className="mr-3 text-red-600" />
                    <span>{personal.yearsOfExperience !== "N/A" ? `${personal.yearsOfExperience} anos de experiência` : "Experiência não informada"}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FaMapMarkerAlt className="mr-3 text-red-600" />
                    <span>{personal.workLocation !== "N/A" ? personal.workLocation : "Local não informado"}</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FaDollarSign className="mr-3 text-red-600" />
                    <span>{personal.pricePerHour !== "N/A" ? `R$ ${personal.pricePerHour}/hora` : "Valor não informado"}</span>
                  </motion.div>

                  {personal.contactInfo?.phone && (
                    <motion.div 
                      className="flex items-center text-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <FaPhone className="mr-3 text-red-600" />
                      <span>{personal.contactInfo.phone}</span>
                    </motion.div>
                  )}

                  {personal.contactInfo?.email && (
                    <motion.div 
                      className="flex items-center text-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <FaEnvelope className="mr-3 text-red-600" />
                      <span>{personal.contactInfo.email}</span>
                    </motion.div>
                  )}
                </div>

                {personal.availableTimes && personal.availableTimes.length > 0 && (
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Horários Disponíveis</h3>
                    <div className="space-y-2">
                      {personal.availableTimes.map((time, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-center text-gray-700"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <FaClock className="mr-3 text-red-600" />
                          <span>{time}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Especialidades</h3>
                  <motion.div 
                    className="flex flex-wrap gap-2 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {personal.specializations.map((spec, index) => (
                      <motion.span
                        key={index}
                        className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {spec}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>

                {personal.biography && (
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Biografia</h3>
                    <p className="text-gray-700">{personal.biography}</p>
                  </motion.div>
                )}

                {personal.education && personal.education.length > 0 && (
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Formação</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {personal.education.map((edu, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          {edu}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {personal.certifications && personal.certifications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Certificações</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {personal.certifications.map((cert, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          {cert}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Botões no rodapé */}
            <div className="border-t p-4 flex justify-end space-x-3">
              <motion.button 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Fechar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PersonalDetailModal; 