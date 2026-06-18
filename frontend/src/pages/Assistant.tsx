import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, MapPin, Star } from 'lucide-react';
import { assistantApi } from '../services/api';
import type { Tour } from '../types';
import { Link } from 'react-router-dom';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  tours?: Tour[];
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      text: 'Привет! Я ваш помощник по подбору туров. Расскажите, куда бы хотели поехать, какой отдых предпочитаете и какой бюджет?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await assistantApi.recommend(userMsg.text);
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text:
          response.tours.length > 0
            ? 'Вот что я нашёл для вас:'
            : 'К сожалению, не удалось найти туры по вашему запросу. Попробуйте другие критерии.',
        tours: response.tours.length > 0 ? response.tours : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: 'Произошла ошибка. Попробуйте ещё раз.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px-80px)] flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Помощник по подбору тура
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Расскажите о своих предпочтениях — мы подберём лучшие варианты</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-600'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600'
                }`}
              >
                {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'assistant'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                {msg.tours && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {msg.tours.map((tour) => (
                      <Link
                        key={tour.id}
                        to={`/tours/${tour.id}`}
                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img src={tour.main_image} alt={tour.title} className="w-full h-24 object-cover" />
                        <div className="p-2">
                          <div className="text-xs font-semibold truncate">{tour.title}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {tour.country.name}
                            </span>
                            <span className="text-xs font-bold text-blue-600">
                              {Math.round(tour.price * (1 - tour.discount / 100)).toLocaleString()} ₽
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Bot className="w-4 h-4 animate-bounce" />
            Думает...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Например: хочу на море недорого в Таиланд"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
