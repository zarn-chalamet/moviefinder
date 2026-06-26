import { motion } from 'framer-motion';
import {
  Star, Clock, Calendar, Film, User, Users, ArrowLeft,
  Heart, Play, Download,
  Subtitles, ExternalLink, MonitorPlay, CloudDownload, AlertCircle
} from 'lucide-react';
import useAppStore from '../store/appStore';
import { mockMovies } from '../data/mockData';

export default function MovieDetailPage() {
  const { t, selectedMovie, setCurrentPage, isMovieSaved, addToSaved, removeFromSaved, setSelectedMovie, language } = useAppStore();

  if (!selectedMovie) {
    setCurrentPage('home');
    return null;
  }

  const movie = selectedMovie;
  const inWatchlist = isMovieSaved(movie.id);
  const similarMovies = mockMovies.filter((m) => m.id !== movie.id).slice(0, 4);

  // Paid streaming platforms
  const paidStreamingProviders = [
    { platform: 'Netflix', logo: '🔴', price: '฿419/mo', type: 'Subscription', url: `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}` },
    { platform: 'Disney+', logo: '🔵', price: '฿399/mo', type: 'Subscription', url: `https://www.disneyplus.com/search?q=${encodeURIComponent(movie.title)}` },
    { platform: 'Amazon Prime', logo: '📦', price: '฿149/mo', type: 'Subscription', url: `https://www.primevideo.com/search?phrase=${encodeURIComponent(movie.title)}` },
    { platform: 'YouTube', logo: '▶️', price: '฿139', type: 'Rent/Buy', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' full movie')}` },
  ];

  // Free streaming platforms (legal)
  const freeStreamingProviders = [
    { platform: 'TrueID', logo: '🟢', price: 'Free', type: 'Free with ads', url: `https://www.trueid.net/search?q=${encodeURIComponent(movie.title)}`, country: '🇹🇭 Thailand' },
    { platform: 'Viu', logo: '🟣', price: 'Free', type: 'Free with ads', url: `https://www.viu.com/search?q=${encodeURIComponent(movie.title)}`, country: '🇹🇭 Thailand' },
    { platform: 'Tubi', logo: '🟠', price: 'Free', type: 'Free with ads', url: `https://tubitv.com/search/${encodeURIComponent(movie.title)}`, country: '🌍 Global' },
    { platform: 'Pluto TV', logo: '🔷', price: 'Free', type: 'Free with ads', url: `https://pluto.tv/search/details/${encodeURIComponent(movie.title)}`, country: '🌍 Global' },
  ];

  // Download sites
  const downloadSites = [
    { name: 'YTS', url: `https://yts.mx/browse-movies/${encodeURIComponent(movie.title)}`, type: 'Torrent', quality: '720p - 4K', icon: '🎬' },
    { name: '1337x', url: `https://1337x.to/search/${encodeURIComponent(movie.title)}/1/`, type: 'Torrent', quality: 'Various', icon: '🔥' },
    { name: 'RARBG', url: `https://rarbg.to/torrents.php?search=${encodeURIComponent(movie.title)}`, type: 'Torrent', quality: '720p - 4K', icon: '⚡' },
    { name: 'Pahe', url: `https://pahe.ink/?s=${encodeURIComponent(movie.title)}`, type: 'Direct', quality: 'Compressed', icon: '📥' },
  ];

  // Free streaming sites (unofficial)
  const freeMovieSites = [
    { name: 'FMovies', url: `https://fmovies.to/search?keyword=${encodeURIComponent(movie.title)}`, quality: 'HD', icon: '🎥' },
    { name: 'HDToday', url: `https://hdtoday.tv/search/${encodeURIComponent(movie.title)}`, quality: 'HD', icon: '📺' },
    { name: 'SFlix', url: `https://sflix.to/search/${encodeURIComponent(movie.title)}`, quality: 'HD', icon: '🍿' },
    { name: 'GoMovies', url: `https://gomovies.sx/search/${encodeURIComponent(movie.title)}`, quality: 'HD', icon: '🎞️' },
  ];

  const subtitles = [
    { lang: '🇹🇭 Thai', format: '.srt', url: `https://subscene.com/subtitles/searchbytitle?query=${encodeURIComponent(movie.title)}` },
    { lang: '🇲🇲 Burmese', format: '.srt', url: `https://subscene.com/subtitles/searchbytitle?query=${encodeURIComponent(movie.title)}` },
    { lang: '🇬🇧 English', format: '.srt', url: `https://opensubtitles.org/en/search/sublanguageid-eng/moviename-${encodeURIComponent(movie.title)}` },
  ];

  const displayTitle = language === 'th' && movie.titleTh
    ? movie.titleTh
    : language === 'my' && movie.titleMy
    ? movie.titleMy
    : movie.title;

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Backdrop */}
      <div className="relative h-[50vh] sm:h-[60vh]">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-dark-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 to-transparent" />

        {/* Back button */}
        <motion.button
          onClick={() => setCurrentPage('trending')}
          className="absolute top-20 left-4 sm:left-8 p-2.5 rounded-xl glass hover:bg-white/10 transition-colors z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0"
          >
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-48 sm:w-56 md:w-64 rounded-2xl shadow-2xl shadow-black/50 mx-auto md:mx-0"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 space-y-5"
          >
            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">{displayTitle}</h1>
              {displayTitle !== movie.title && (
                <p className="text-dark-400 text-lg mt-1">{movie.title}</p>
              )}
              {movie.tagline && (
                <p className="text-primary-400 italic mt-2">"{movie.tagline}"</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-400 font-semibold">
                <Star className="w-4 h-4 fill-yellow-400" />
                {movie.rating}/10
                <span className="text-dark-500 font-normal text-xs">({movie.voteCount.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1.5 text-dark-300">
                <Calendar className="w-4 h-4 text-dark-500" />
                {movie.year}
              </div>
              <div className="flex items-center gap-1.5 text-dark-300">
                <Clock className="w-4 h-4 text-dark-500" />
                {movie.runtime} {t('movie.minutes')}
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <span key={g} className="px-4 py-1.5 rounded-full bg-primary-600/15 text-primary-300 text-sm font-medium border border-primary-500/10">
                  {g}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <motion.a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 font-semibold shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play className="w-5 h-5" />
                {t('movie.trailer')}
                <ExternalLink className="w-4 h-4 opacity-60" />
              </motion.a>
              <motion.button
                onClick={() => inWatchlist ? removeFromSaved(movie.id) : addToSaved(movie)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                inWatchlist
                  ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                  : 'glass hover:bg-white/10'
              }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
              {inWatchlist ? <Heart className="w-5 h-5 fill-red-500 text-red-500" /> : <Heart className="w-5 h-5" />}
              {inWatchlist ? 'Saved' : 'Save Movie'}
              </motion.button>
            </div>

            {/* Director & Cast */}
            <div className="space-y-3">
              {movie.director && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-dark-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">{t('movie.director')}</p>
                    <p className="text-sm text-dark-200">{movie.director}</p>
                  </div>
                </div>
              )}
              {movie.cast && (
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-dark-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">{t('movie.cast')}</p>
                    <p className="text-sm text-dark-200">{movie.cast.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Overview */}
            <div>
              <h3 className="text-sm text-dark-500 font-medium uppercase tracking-wider mb-2">{t('movie.overview')}</h3>
              <p className="text-dark-300 leading-relaxed">
                {language === 'th' && movie.overviewTh ? movie.overviewTh : movie.overview}
              </p>
            </div>
          </motion.div>
        </div>

        {/* PAID Streaming Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 space-y-4"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-primary-400" />
            💳 Paid Streaming Platforms
          </h3>
          <p className="text-dark-500 text-sm">Click to search on each platform (subscription required)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {paidStreamingProviders.map((s, i) => (
              <motion.a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl glass hover:bg-white/5 transition-all cursor-pointer group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.logo}</span>
                  <div>
                    <p className="font-semibold text-sm">{s.platform}</p>
                    <p className="text-xs text-dark-400">{s.type}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <p className="text-sm font-medium text-dark-300">{s.price}</p>
                  <ExternalLink className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* FREE Streaming Platforms (Legal) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 space-y-4"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Film className="w-5 h-5 text-neon-green" />
            ✅ Free Legal Streaming
          </h3>
          <p className="text-dark-500 text-sm">Watch for free with ads (legal platforms)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {freeStreamingProviders.map((s, i) => (
              <motion.a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl glass border border-neon-green/20 hover:border-neon-green/40 hover:bg-neon-green/5 transition-all cursor-pointer group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.logo}</span>
                  <div>
                    <p className="font-semibold text-sm">{s.platform}</p>
                    <p className="text-xs text-dark-400">{s.country}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <p className="text-sm font-semibold text-neon-green">{s.price}</p>
                  <ExternalLink className="w-4 h-4 text-dark-500 group-hover:text-neon-green transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* FREE Movie Sites (Unofficial) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 space-y-4"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-neon-cyan" />
            🎬 Free Movie Sites
          </h3>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300">These are third-party sites. Use ad-blocker recommended. We don't host any content.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {freeMovieSites.map((site, i) => (
              <motion.a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-white/5 transition-all cursor-pointer group"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-xl">{site.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{site.name}</p>
                  <p className="text-xs text-neon-cyan">{site.quality}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-dark-500 group-hover:text-neon-cyan transition-colors flex-shrink-0" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Download Sites */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 space-y-4"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <CloudDownload className="w-5 h-5 text-neon-purple" />
            📥 Download Links
          </h3>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Download className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-purple-300">Torrent downloads require a torrent client (qBittorrent, uTorrent). Use VPN recommended.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {downloadSites.map((site, i) => (
              <motion.a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl glass hover:bg-white/5 transition-all cursor-pointer group border border-neon-purple/10 hover:border-neon-purple/30"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-xl">{site.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{site.name}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-dark-400">{site.type}</span>
                    <span className="text-dark-600">•</span>
                    <span className="text-neon-purple">{site.quality}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-dark-500 group-hover:text-neon-purple transition-colors flex-shrink-0" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Subtitles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 space-y-4"
        >
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Subtitles className="w-5 h-5 text-accent-400" />
            {t('movie.subtitles')}
          </h3>
          <p className="text-dark-500 text-sm">Click to search and download subtitles from external sites</p>
          <div className="flex flex-wrap gap-3">
            {subtitles.map((sub) => (
              <motion.a
                key={sub.lang}
                href={sub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl glass hover:bg-white/5 transition-colors cursor-pointer group"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-sm font-medium">{sub.lang}</span>
                <span className="text-xs text-dark-500">{sub.format}</span>
                <Download className="w-3.5 h-3.5 text-dark-500 group-hover:text-primary-400 transition-colors" />
                <ExternalLink className="w-3 h-3 text-dark-600" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Similar Movies */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pb-16 space-y-4"
        >
          <h3 className="text-xl font-bold">{t('movie.similar')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similarMovies.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => {
                  setSelectedMovie(m);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group glass rounded-xl overflow-hidden hover:ring-1 hover:ring-primary-500/30 transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold line-clamp-1">{m.title}</p>
                  <div className="flex items-center gap-2 text-xs text-dark-400 mt-1">
                    <span className="flex items-center gap-0.5 text-yellow-400">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {m.rating}
                    </span>
                    <span>{m.year}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
