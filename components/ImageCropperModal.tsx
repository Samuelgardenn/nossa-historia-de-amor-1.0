'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ZoomIn, ZoomOut } from 'lucide-react';

export interface Point {
  x: number;
  y: number;
}

export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio: number; // e.g., 1 for square, 3/4 for polaroids
  onClose: () => void;
  onCropComplete: (croppedImageBase64: string) => void;
  tema?: string;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  maxWidth = 800
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Calculate scaling if the cropped area is larger than maxWidth
  let outputWidth = pixelCrop.width;
  let outputHeight = pixelCrop.height;

  if (outputWidth > maxWidth) {
    const ratio = maxWidth / outputWidth;
    outputWidth = maxWidth;
    outputHeight = pixelCrop.height * ratio;
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return canvas.toDataURL('image/jpeg', 0.8);
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  aspectRatio,
  onClose,
  onCropComplete,
  tema = 'pink-blush'
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBase64);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Erro ao cortar a imagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isDark = tema === 'sophisticated-dark';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-2xl flex flex-col rounded-3xl overflow-hidden shadow-2xl ${
              isDark ? 'bg-[#150F0F] border border-[#2A1E1E]' : 'bg-white border border-pink-100'
            }`}
          >
            {/* Header */}
            <div className={`flex justify-between items-center p-4 border-b ${isDark ? 'border-[#2A1E1E]' : 'border-rose-100'}`}>
              <h3 className={`font-bold font-sans ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Enquadrar Foto
              </h3>
              <button 
                onClick={onClose}
                className={`p-1.5 rounded-full transition-colors ${
                  isDark ? 'hover:bg-[#251B1B] text-[#D48C70]' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative w-full h-[50vh] min-h-[300px] bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controls */}
            <div className={`p-4 md:p-6 space-y-6 ${isDark ? 'bg-[#150F0F]' : 'bg-white'}`}>
              
              {/* Zoom Slider */}
              <div className="flex items-center gap-3 w-full max-w-md mx-auto">
                <ZoomOut className={`w-5 h-5 ${isDark ? 'text-[#D48C70]/70' : 'text-slate-400'}`} />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 accent-rose-500 rounded-lg cursor-pointer"
                />
                <ZoomIn className={`w-5 h-5 ${isDark ? 'text-[#D48C70]/70' : 'text-slate-400'}`} />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isDark 
                      ? 'bg-[#251B1B] hover:bg-[#2A1E1E] text-[#EAD7D1]' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
                    isDark
                      ? 'bg-[#D48C70] hover:bg-[#E2A68E] text-[#0F0A0A]'
                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200'
                  }`}
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Cortando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Confirmar Recorte
                    </>
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
