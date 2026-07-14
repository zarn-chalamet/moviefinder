import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, Image as ImageIcon, Link2, ArrowLeft,
  Star, Clock, Heart, ChevronRight,
  RotateCcw, Copy, Check, MessageSquarePlus,
  AlertCircle, ExternalLink, Wand2, Film, Compass,
} from 'lucide-react';
import useAppStore from '../store/appStore';
import { ChatMessage, Movie, StreamingProvider } from '../types';
import ConfidenceBadge from './ConfidenceBadge';
import MovieCandidatesList from './MovieCandidatesList';
import ConfirmDialog from './ConfirmDialog';

// ============================================
// Typing Indicator
// ============================================
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 items-start"
    >
      <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary-400" strokeWidth={1.5} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-dark-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Movie Card
// ============================================
function MovieCard({
  movie, streaming, onViewDetails,
}: {
  movie: Movie;
  streaming?: StreamingProvider[];
  onViewDetails: () => void;
}) {
  const { t, isMovieSaved, addToSaved, removeFromSaved } = useAppStore();
  const movieId = movie.tmdbId || movie.id;
  const inWatchlist = isMovieSaved(movieId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden mt-3"
    >
      <div className="flex gap-4 p-4">
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-24 sm:w-28 h-36 sm:h-40 rounded-xl object-cover flex-shrink-0"
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="font-semibold text-base leading-tight tracking-tight">
            {movie.title}
          </h3>
          {movie.tagline && (
            <p className="text-xs text-dark-500 italic">"{movie.tagline}"</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            {movie.rating > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3 h-3 fill-yellow-400" />
                {movie.rating}
              </span>
            )}
            {movie.runtime > 0 && (
              <span className="text-dark-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {movie.runtime} {t('movie.minutes')}
              </span>
            )}
            {movie.year && <span className="text-dark-500 font-mono">{movie.year}</span>}
          </div>
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 3).map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.02] text-[10px] text-dark-400">
                  {g}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1 flex-wrap">
            <button
              onClick={onViewDetails}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-dark-950 text-xs font-semibold hover:bg-dark-200 transition-colors"
            >
              {t('movie.findTitle')}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => inWatchlist ? removeFromSaved(movieId) : addToSaved(movie)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                inWatchlist ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-white/10 text-dark-300 hover:text-white hover:border-white/20'
              }`}
            >
              <Heart className={`w-3 h-3 ${inWatchlist ? 'fill-red-400 text-red-400' : ''}`} />
              {inWatchlist ? t('movie.saved') : t('movie.saveMovie')}
            </button>
          </div>
        </div>
      </div>

      {streaming && streaming.length > 0 && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
          <p className="text-[10px] text-dark-500 font-mono uppercase tracking-widest">
            {t('movie.whereToWatch')}
          </p>
          <div className="flex flex-wrap gap-2">
            {streaming.slice(0, 3).map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs text-dark-300 hover:text-white hover:border-white/20 transition-colors"
              >
                {s.logo && <span>{s.logo}</span>}
                <span>{s.platform}</span>
                <span className="text-dark-600">·</span>
                <span className="text-dark-400">{s.price}</span>
              </a>
            ))}
            <button
              onClick={onViewDetails}
              className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-primary-400 hover:border-white/20 transition-colors"
            >
              +{t('common.more')}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// Chinese Short Drama Card
// ============================================
function ChineseShortDramaCard() {
  const platforms = [
    { name: 'ShortMax', url: 'https://shortmax.com', icon: '📱' },
    { name: 'DramaBox', url: 'https://dramabox.com', icon: '🎭' },
    { name: 'ReelShort', url: 'https://reelshort.com', icon: '🎬' },
    { name: 'GoodShort', url: 'https://goodshort.app', icon: '⭐' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🇨🇳</span>
        <div>
          <h4 className="font-semibold text-sm tracking-tight">Chinese Short Drama</h4>
          <p className="text-xs text-dark-500">Try these platforms:</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 text-xs text-dark-300 hover:text-white hover:border-white/20 transition-colors group"
          >
            <span>{p.icon}</span>
            <span className="flex-1 font-medium">{p.name}</span>
            <ExternalLink className="w-3 h-3 text-dark-600 group-hover:text-primary-400 transition-colors" strokeWidth={1.5} />
          </a>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// Analysis Method Badge
// ============================================
function AnalysisMethodBadge({ method }: { method?: string }) {
  if (!method || method === 'error' || method === 'failed') return null;

  const config: Record<string, { icon: string; label: string }> = {
    hashtag: { icon: '🏷️', label: 'Identified via hashtag' },
    explicit_title: { icon: '📝', label: 'Title found in description' },
    metadata_ai: { icon: '🧠', label: 'AI analyzed metadata' },
    recap_match: { icon: '🎥', label: 'Recap video analysis' },
    recap_candidates: { icon: '🔍', label: 'Multiple recap matches' },
    audio_narration: { icon: '🎙️', label: 'Detected from audio' },
    vision: { icon: '👁️', label: 'Video frame analysis' },
    vision_only: { icon: '👁️', label: 'Visual analysis only' },
    vision_candidates: { icon: '🔍', label: 'Multiple visual matches' },
    vision_high: { icon: '✨', label: 'High confidence vision' },
    vision_unknown: { icon: '❓', label: 'Uncertain identification' },
    classification: { icon: '🎯', label: 'Content classified' },
    similar_movies: { icon: '🎬', label: 'Similar movie suggestions' },
    text: { icon: '📝', label: 'Text analysis' },
  };

  const cfg = config[method] || { icon: '✨', label: method };

  return (
    <div className="text-[11px] text-dark-500 flex items-center gap-1.5">
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </div>
  );
}

// ============================================
// Message Actions
// ============================================
function MessageActions({ message, onRetry }: { message: ChatMessage; onRetry: () => void; }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
      {message.originalUserMessage && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 text-[11px] text-dark-500 hover:text-dark-200 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      )}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 text-[11px] text-dark-500 hover:text-dark-200 transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
}

// ============================================
// Format Message
// ============================================
function formatMessage(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-dark-400">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ============================================
// Suggestion Chip
// ============================================
function SuggestionChip({ text }: { text: string }) {
  const { sendMessage } = useAppStore();
  return (
    <button
      onClick={() => sendMessage(text)}
      className="px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 text-xs text-dark-400 hover:text-white transition-colors"
    >
      {text}
    </button>
  );
}

// ============================================
// Message Bubble
// ============================================
function MessageBubble({
  message, onViewDetails, onRetry, onCandidateSelect,
}: {
  message: ChatMessage;
  onViewDetails: (movie: Movie) => void;
  onRetry: (messageId: string) => void;
  onCandidateSelect: (movie: Movie) => void;
}) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-1 ${
          isError ? 'border-red-500/30 bg-red-500/10' : 'border-white/10 bg-white/[0.02]'
        }`}>
          {isError ? (
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-primary-400" strokeWidth={1.5} />
          )}
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : ''}`}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'rounded-2xl rounded-tr-sm bg-white/5 border border-white/10 text-dark-100'
              : isError
              ? 'rounded-2xl rounded-tl-sm bg-red-500/10 border border-red-500/20 text-dark-200'
              : 'rounded-2xl rounded-tl-sm border border-white/5 bg-white/[0.02] text-dark-200'
          }`}
        >
          {formatMessage(message.content)}
        </div>

        {!isUser && !isError && (message.confidenceLevel || message.confidenceScore || message.analysisMethod) && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {(message.confidenceLevel || message.confidenceScore) && (
              <ConfidenceBadge level={message.confidenceLevel} score={message.confidenceScore} />
            )}
            <AnalysisMethodBadge method={message.analysisMethod} />
          </div>
        )}

        {message.isChineseShortDrama && <ChineseShortDramaCard />}

        {message.movieContext && !message.isChineseShortDrama && (
          <MovieCard
            movie={message.movieContext}
            streaming={message.streamingInfo}
            onViewDetails={() => onViewDetails(message.movieContext!)}
          />
        )}

        {message.candidates && message.candidates.length > 0 && (
          <MovieCandidatesList
            candidates={message.candidates}
            onSelect={onCandidateSelect}
            variant={message.analysisMethod === 'similar_movies' ? 'recommendations' : 'candidates'}
          />
        )}

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((s, i) => (
              <SuggestionChip key={i} text={s} />
            ))}
          </div>
        )}

        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : ''}`}>
          <p className="text-[11px] text-dark-600">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {!isUser && (
            <MessageActions message={message} onRetry={() => onRetry(message.id)} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN CHAT PAGE
// ============================================
export default function ChatPage() {
  const {
    t, messages, isTyping, sendMessage,
    setCurrentPage, setSelectedMovie,
    language, retryMessage, startNewChat,
    showConfirmDialog,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
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

  const handleCandidateSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentPage('movie-detail');
  };

  const handleNewChat = () => {
    if (messages.length === 0) return;
    showConfirmDialog(
      t('chat.newChatConfirm.title'),
      t('chat.newChatConfirm.message'),
      () => {
        startNewChat();
        setInput('');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    );
  };

  // suggestions — no colored gradients
  const suggestionCategories = language === 'th'
  ? [
      { icon: Link2, labelKey: 'chat.category.link', text: 'https://www.tiktok.com/@movie/video/123' },
      { icon: Wand2, labelKey: 'chat.category.scene', text: 'หนังที่คนเข้าไปในความฝัน' },
      { icon: Film, labelKey: 'chat.category.theme', text: 'หนังอวกาศที่มีหลุมหนอน' },
      { icon: Compass, labelKey: 'chat.category.recommend', text: 'แนะนำหนังสนุกๆ' },
    ]
  : language === 'my'
  ? [
      { icon: Link2, labelKey: 'chat.category.link', text: 'https://www.tiktok.com/@movie/video/123' },
      { icon: Wand2, labelKey: 'chat.category.scene', text: 'အိပ်မက်ထဲ ဝင်ရောက်နိုင်တဲ့ ရုပ်ရှင်' },
      { icon: Film, labelKey: 'chat.category.theme', text: 'အာကာသ ရုပ်ရှင်တစ်ခု ညွှန်းပါ' },
      { icon: Compass, labelKey: 'chat.category.recommend', text: 'ကောင်းတဲ့ ရုပ်ရှင်တွေ ပြောပြပါ' },
    ]
  : [
      { icon: Link2, labelKey: 'chat.category.link', text: 'https://www.tiktok.com/@movie/video/123' },
      { icon: Wand2, labelKey: 'chat.category.scene', text: 'A movie where a man can enter dreams' },
      { icon: Film, labelKey: 'chat.category.theme', text: 'A space movie with wormholes' },
      { icon: Compass, labelKey: 'chat.category.recommend', text: 'Recommend me a good thriller' },
    ];

  return (
    <>
      <ConfirmDialog />

      {/* pt-16 pushes below navbar. h-screen minus navbar height */}
      <div className="h-screen bg-dark-950 pt-16 flex flex-col">
        <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col min-h-0">

          {/* ============================================
              Chat Header — NO fixed positioning
          ============================================ */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-dark-400" strokeWidth={1.5} />
            </button>

            <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" strokeWidth={1.5} />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm tracking-tight truncate">
                {t('chat.title')}
              </h2>
              <p className="text-[11px] text-dark-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                AI Ready
              </p>
            </div>

            <button
              onClick={handleNewChat}
              disabled={messages.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                messages.length === 0
                  ? 'border-transparent text-dark-600 cursor-not-allowed'
                  : 'border-white/10 text-dark-300 hover:text-white hover:border-white/20'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">{t('chat.newChat')}</span>
            </button>
          </div>

          {/* ============================================
              Messages
          ============================================ */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 min-h-0">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full py-8"
              >
                {/* ============================================
                    Editorial Welcome — matches About page
                ============================================ */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs text-dark-300 mb-8"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  {t('chat.hero.badge')}
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-bold tracking-[-0.04em] leading-[1.05] text-center mb-4"
                >
                  {t('chat.hero.title1')}
                  <br />
                  <span className="text-gradient">{t('chat.hero.title2')}</span>
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-dark-400 text-sm leading-relaxed max-w-md text-center mb-12"
                >
                  {t('chat.welcome')}
                </motion.p>

                {/* ============================================
                    Suggestion Cards — MINIMAL like About page
                ============================================ */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="w-full max-w-2xl"
                >
                  <p className="text-xs font-mono uppercase tracking-widest text-primary-400 mb-4 text-center">
                    {t('chat.hero.tryAsking')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    {suggestionCategories.map((s, i) => (
                      <motion.button
                        key={i}
                        onClick={() => sendMessage(s.text)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="group bg-dark-950 p-4 hover:bg-white/[0.02] transition-colors text-left"
                      >
                        <div className="flex items-start gap-3">
                          <s.icon
                            className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors mt-0.5 flex-shrink-0"
                            strokeWidth={1.5}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-dark-500 mb-1">
                              {t(s.labelKey)}
                            </p>
                            <p className="text-sm text-dark-300 group-hover:text-white transition-colors line-clamp-1 leading-snug">
                              {s.text}
                            </p>
                          </div>
                          <ChevronRight
                            className="w-3.5 h-3.5 text-dark-700 group-hover:text-dark-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1"
                            strokeWidth={1.5}
                          />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onViewDetails={handleViewDetails}
                  onRetry={retryMessage}
                  onCandidateSelect={handleCandidateSelect}
                />
              ))}
            </AnimatePresence>

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* ============================================
              Input
          ============================================ */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-white/5">
            <div
              className={`relative flex items-center gap-2 p-1.5 rounded-full border transition-colors ${
                isFocused
                  ? 'border-white/20 bg-white/[0.03]'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <button
                className="p-2 rounded-full hover:bg-white/5 text-dark-400 hover:text-dark-200 transition-colors flex-shrink-0"
                title={t('chat.upload')}
              >
                <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={t('chat.placeholder')}
                className="flex-1 bg-transparent px-2 py-2 text-sm placeholder:text-dark-600 focus:outline-none min-w-0"
                disabled={isTyping}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
                  input.trim() && !isTyping
                    ? 'bg-white text-dark-950 hover:bg-dark-200'
                    : 'bg-white/[0.03] text-dark-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-[10px] text-dark-600 text-center mt-2 font-mono">
              {t('chat.hero.enterHint')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}