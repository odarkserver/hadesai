import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 bg-zinc-900/50 rounded-full transition-colors"
      >
        <X size={24} />
      </button>
      
      <div className="relative max-w-full max-h-full flex flex-col items-center justify-center">
        <img 
            src={imageUrl} 
            alt="Full Preview" 
            className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" 
        />
        
        <div className="mt-6 flex gap-4">
             <a 
                href={imageUrl} 
                download={`grok-image-${Date.now()}.png`}
                className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
             >
                <Download size={18} />
                Unduh Gambar
             </a>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;