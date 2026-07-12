import { motion } from 'framer-motion';
import { CheckCircle2, ThumbsUp, HelpCircle, XCircle } from 'lucide-react';
import { ConfidenceLevel } from '../types';

interface ConfidenceBadgeProps {
  level?: ConfidenceLevel;
  score?: number;
  size?: 'sm' | 'md';
}

export default function ConfidenceBadge({ level, score, size = 'sm' }: ConfidenceBadgeProps) {
  if (!level && !score) return null;

  const config = getConfig(level, score);
  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-1 text-xs gap-1.5' 
    : 'px-3 py-1.5 text-sm gap-2';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${config.className}`}
    >
      <config.Icon className={`${iconSize} flex-shrink-0`} />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-70">·  {score}%</span>
      )}
    </motion.div>
  );
}

function getConfig(level?: ConfidenceLevel, score?: number) {
  // Determine level from score if not provided
  if (!level && score !== undefined) {
    if (score >= 90) level = 'CERTAIN';
    else if (score >= 70) level = 'LIKELY';
    else if (score >= 50) level = 'UNCERTAIN';
    else level = 'UNKNOWN';
  }

  switch (level) {
    case 'CERTAIN':
      return {
        Icon: CheckCircle2,
        label: 'Certain',
        className: 'bg-green-500/15 text-green-400 border border-green-500/30',
      };
    case 'LIKELY':
      return {
        Icon: ThumbsUp,
        label: 'Likely',
        className: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      };
    case 'UNCERTAIN':
      return {
        Icon: HelpCircle,
        label: 'Uncertain',
        className: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
      };
    case 'UNKNOWN':
    default:
      return {
        Icon: XCircle,
        label: 'Unknown',
        className: 'bg-red-500/15 text-red-400 border border-red-500/30',
      };
  }
}