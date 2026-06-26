import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, Image, Link2, ArrowLeft,
  Star, Clock, Heart,
  ChevronRight
} from 'lucide-react';
import useAppStore from '../store/appStore';
import { ChatMessage, Movie, StreamingProvider } from '../types';

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm glass-light">
        <div className="typing-dots flex items-center gap-1">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

function MovieCard({
  movie,
  streaming,
  onViewDetails,
}: {
  movie: Movie;
  streaming?: StreamingProvider[];
  onViewDetails: () => void;
}) {
  const { t, isMovieSaved, addToSaved, removeFromSaved } = useAppStore();
  const inWatchlist = isMovieSaved(movie.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass overflow-hidden mt-3"
    >
      <div className="flex gap-4 p-4">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-24 sm:w-28 h-36 sm:h-40 rounded-xl object-cover shadow-lg flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="font-bold text-lg leading-tight">{movie.title}</h3>
          {movie.tagline && (
            <p className="text-xs text-dark-400 italic">"{movie.tagline}"</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 text-yellow-400">
              <Star className="w-3 h-3 fill-yellow-400" />
              {movie.rating}
            </span>
            <span className="text-dark-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.runtime} {t('movie.minutes')}
            </span>
            <span className="text-dark-400">{movie.year}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {movie.genres.map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-300 text-xs">
                {g}
              </span>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <motion.button
              onClick={onViewDetails}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600/30 hover:bg-primary-600/50 text-primary-300 text-xs font-medium transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-3 h-3" />
              Watch/Download Links
            </motion.button>
            <motion.button
              onClick={() => inWatchlist ? removeFromSaved(movie.id) : addToSaved(movie)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                inWatchlist
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/5 hover:bg-white/10 text-dark-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {inWatchlist ? <Heart className="w-3 h-3 fill-red-500 text-red-500" /> : <Heart className="w-3 h-3" />}
              {inWatchlist ? 'Saved' : 'Save'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Links - Preview */}
      {streaming && streaming.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-dark-400 font-medium flex items-center gap-1">
            {t('movie.whereToWatch')} 
            <span className="text-dark-600">(click for all links)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {streaming.slice(0, 3).map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                  s.isFree
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20'
                    : 'bg-white/5 text-dark-300 border border-white/5 hover:bg-white/10'
                }`}
              >
                <span>{s.logo}</span>
                <span>{s.platform}</span>
                <span className="text-dark-500">·</span>
                <span className={s.isFree ? 'text-neon-green' : 'text-dark-400'}>{s.price}</span>
              </a>
            ))}
            <button
              onClick={onViewDetails}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-primary-400 hover:bg-white/10 transition-colors"
            >
              +More Links
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MessageBubble({
  message,
  onViewDetails,
}: {
  message: ChatMessage;
  onViewDetails: (movie: Movie) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-0 ${isUser ? 'items-end' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-primary-600/40 rounded-tr-sm'
              : 'glass-light rounded-tl-sm'
          }`}
        >
          {formatMessage(message.content)}
        </div>

        {/* Movie Card */}
        {message.movieContext && (
          <MovieCard
            movie={message.movieContext}
            streaming={message.streamingInfo}
            onViewDetails={() => onViewDetails(message.movieContext!)}
          />
        )}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((s, i) => (
              <SuggestionChip key={i} text={s} />
            ))}
          </div>
        )}

        <p className={`text-xs text-dark-600 mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

function formatMessage(text: string) {
  // Simple markdown-like formatting
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-dark-300">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

function SuggestionChip({ text }: { text: string }) {
  const { sendMessage } = useAppStore();
  return (
    <motion.button
      onClick={() => sendMessage(text)}
      className="px-3 py-1.5 rounded-full glass-light hover:bg-white/10 text-xs text-dark-300 hover:text-white transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {text}
    </motion.button>
  );
}

export default function ChatPage() {
  const { t, messages, isTyping, sendMessage, setCurrentPage, setSelectedMovie, language } = useAppStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleViewDetails = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentPage('movie-detail');
  };

  const quickSuggestions = language === 'th'
    ? [
        'https://www.tiktok.com/@movie/video/123',
        'หนังที่คนเข้าไปในความฝัน',
        'หนังอวกาศที่มีหลุมหนอน',
        'แนะนำหนังสนุกๆ',
      ]
    : language === 'my'
    ? [
        'https://www.tiktok.com/@movie/video/123',
        'အိပ်မက်ထဲ ဝင်ရောက်နိုင်တဲ့ ရုပ်ရှင်',
        'အာကာသ ရုပ်ရှင်တစ်ခု ညွှန်းပါ',
        'ကောင်းတဲ့ ရုပ်ရှင်တွေ ပြောပြပါ',
      ]
    : [
        'https://www.tiktok.com/@movie/video/123',
        'A movie where a man can enter dreams',
        'A space movie with wormholes',
        'Recommend me a good thriller',
      ];

  return (
    <div className="min-h-screen bg-dark-950 pt-16">
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
          <motion.button
            onClick={() => setCurrentPage('home')}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-dark-400" />
          </motion.button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-sm">{t('chat.title')}</h2>
            <p className="text-xs text-neon-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
              Online · AI Ready
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-8"
            >
              {/* Welcome */}
              <div className="space-y-4 max-w-md">
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto shadow-lg shadow-primary-600/30"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold">{t('chat.title')}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{t('chat.welcome')}</p>
                <p className="text-dark-500 text-sm">{t('chat.welcome2')}</p>
              </div>

              {/* Quick Suggestions */}
              <div className="w-full max-w-lg space-y-3">
                <p className="text-xs text-dark-500 font-medium">{t('chat.suggestions.title')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickSuggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/5 transition-all text-left group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                        {i === 0 ? <Link2 className="w-4 h-4 text-primary-400" /> :
                         <Sparkles className="w-4 h-4 text-primary-400" />}
                      </div>
                      <span className="text-xs text-dark-300 group-hover:text-white transition-colors line-clamp-2">{s}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onViewDetails={handleViewDetails}
              />
            ))}
          </AnimatePresence>

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <motion.button
              className="p-3 rounded-xl glass-light hover:bg-white/10 transition-colors"
              whileTap={{ scale: 0.9 }}
              title={t('chat.upload')}
            >
              <Image className="w-5 h-5 text-dark-400" />
            </motion.button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('chat.placeholder')}
                className="w-full px-5 py-3.5 rounded-2xl glass-light text-sm placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all bg-transparent"
                disabled={isTyping}
              />
            </div>

            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-2xl transition-all ${
                input.trim() && !isTyping
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50'
                  : 'bg-dark-800 text-dark-600'
              }`}
              whileHover={input.trim() ? { scale: 1.05 } : {}}
              whileTap={input.trim() ? { scale: 0.95 } : {}}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
