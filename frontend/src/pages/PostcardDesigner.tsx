import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Palette, Download, Share2, Image as ImageIcon, Type, Check } from 'lucide-react';
import type { RootState } from '../store';
import { fetchTours } from '../store/slices/toursSlice';
import { postcardsApi } from '../services/api';
import type { Tour, Postcard } from '../types';

export default function PostcardDesigner() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tours } = useSelector((state: RootState) => state.tours);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [message, setMessage] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(28);
  const [saved, setSaved] = useState(false);
  const [myPostcards, setMyPostcards] = useState<Postcard[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    dispatch(fetchTours() as any);
    postcardsApi.get().then(setMyPostcards);
  }, [dispatch]);

  useEffect(() => {
    drawCanvas();
  }, [selectedTour, message, textColor, fontSize]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    // Background
    if (selectedTour) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        // Text
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        wrapText(ctx, message || 'Ваш текст здесь...', canvas.width / 2, canvas.height / 2, canvas.width - 100, fontSize * 1.4);
        ctx.shadowBlur = 0;
        // Footer
        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(`С любовью из ${selectedTour.country.name} ❤️`, canvas.width / 2, canvas.height - 40);
      };
      img.src = selectedTour.main_image;
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Выберите тур для создания открытки', canvas.width / 2, canvas.height / 2);
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y - ((words.length / 6) * lineHeight) / 2;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `postcard_${selectedTour?.id || 'travel'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSave = async () => {
    if (!selectedTour || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    await postcardsApi.create({ tour: selectedTour.id, image_url: dataUrl, message });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    postcardsApi.get().then(setMyPostcards);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Palette className="w-7 h-7 text-pink-500" />
        Конструктор открыток
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Создайте уникальную открытку из своего путешествия</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-xl shadow-lg"
              style={{ maxHeight: '400px', width: 'auto' }}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDownload}
              disabled={!selectedTour}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Скачать
            </button>
            {user && (
              <button
                onClick={handleSave}
                disabled={!selectedTour}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {saved ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {saved ? 'Сохранено' : 'Сохранить'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Выберите тур
            </h3>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {tours.map((tour) => (
                <button
                  key={tour.id}
                  onClick={() => setSelectedTour(tour)}
                  className={`relative rounded-lg overflow-hidden aspect-square ${
                    selectedTour?.id === tour.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img src={tour.main_image} alt={tour.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Текст
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ваше послание..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-3"
            />
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="range"
                min={16}
                max={48}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">{fontSize}px</span>
            </div>
          </div>
        </div>
      </div>

      {myPostcards.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Мои открытки</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {myPostcards.map((pc) => (
              <div key={pc.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
                {pc.image_url ? (
                  <img src={pc.image_url} alt="" className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700" />
                )}
                <div className="p-3">
                  <div className="text-xs text-gray-500">{pc.tour.title}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-1">{pc.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
