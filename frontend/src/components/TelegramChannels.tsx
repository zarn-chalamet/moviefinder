import { motion } from 'framer-motion';
import { Send, Copy, Check, Lock, Globe2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import useAppStore from '../store/appStore';
import {
  getRelevantTelegramChannels,
  getTelegramChannelUrl,
  TelegramChannel,
} from '../data/streamingSources';

interface TelegramChannelsProps {
  movieTitle: string;
  originalLanguage?: string;
  genres?: string[];
}

export default function TelegramChannels({
  movieTitle,
  originalLanguage,
  genres,
}: TelegramChannelsProps) {
  const { t } = useAppStore();
  const [copiedTitle, setCopiedTitle] = useState(false);
  const channels = getRelevantTelegramChannels(originalLanguage, genres);

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(movieTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  if (channels.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Send className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{t('movie.telegramTitle')}</h3>
          <p className="text-xs text-dark-400">{t('movie.telegramSubtitle')}</p>
        </div>
      </div>

      {/* Copy Title Instruction */}
      <div className="glass rounded-xl p-3 border border-blue-500/10 bg-blue-500/5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-dark-300 font-medium mb-1">
              💡 Copy the title below, then open a channel and search inside Telegram
            </p>
            <p className="text-[11px] text-dark-500 truncate">
              "{movieTitle}"
            </p>
          </div>
          <motion.button
            onClick={handleCopyTitle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition-colors flex-shrink-0"
            whileTap={{ scale: 0.95 }}
          >
            {copiedTitle ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {channels.map((channel, idx) => (
          <ChannelCard
            key={channel.url}
            channel={channel}
            idx={idx}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// Individual Channel Card
// ============================================
function ChannelCard({
  channel,
  idx,
}: {
  channel: TelegramChannel;
  idx: number;
}) {
  const channelUrl = getTelegramChannelUrl(channel);
  const isPrivate = channel.type === 'invite';

  // Category badge colors
  const categoryColors: Record<string, string> = {
    general: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    korean: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    chinese: 'bg-red-500/10 text-red-400 border-red-500/20',
    thai: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    hollywood: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    series: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    anime: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  const categoryLabels: Record<string, string> = {
    general: 'General',
    korean: '🇰🇷 K-Drama',
    chinese: '🇨🇳 Chinese',
    thai: '🇹🇭 Thai',
    hollywood: '🇺🇸 English',
    series: '📺 Series',
    anime: '🎌 Anime',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="glass rounded-xl p-3.5 border border-blue-500/10 hover:border-blue-500/30 transition-all"
    >
      {/* Channel Info */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm truncate">
                {channel.name}
              </p>
              {isPrivate ? (
                <span title="Private channel" className="shrink-0">
                  <Lock className="w-3 h-3 text-dark-500" />
                </span>
              ) : (
                <span title="Public channel" className="shrink-0">
                  <Globe2 className="w-3 h-3 text-dark-500" />
                </span>
              )}
            </div>
          </div>
          {/* Category Badge */}
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${
              categoryColors[channel.category] || categoryColors.general
            }`}
          >
            {categoryLabels[channel.category] || channel.category}
          </span>
        </div>
        <p className="text-xs text-dark-400 line-clamp-2">
          {channel.description}
        </p>
      </div>

      {/* Single Action Button - Just Open Channel */}
      <motion.a
        href={channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        <Send className="w-3 h-3" />
        {isPrivate ? 'Join Channel' : 'Open Channel'}
        <ExternalLink className="w-3 h-3 opacity-60" />
      </motion.a>
    </motion.div>
  );
}