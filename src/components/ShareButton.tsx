import React, { useState } from 'react';
import { Share2, Twitter, Send, Copy, Check } from 'lucide-react';
import { useI18n } from '../../client/i18n/useI18n';

interface ShareButtonProps {
  id: string;
  type: 'catalyst' | 'builder';
  title: string;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
  variant?: 'compact' | 'full';
}

export default function ShareButton({
  id,
  type,
  title,
  addNotification,
  variant = 'compact'
}: ShareButtonProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a mock deep link that reflects Kairo's routing state
  const getDeepLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?tab=${type === 'catalyst' ? 'catalysts' : 'builderHub'}&id=${id}`;
  };

  const shareUrl = getDeepLink();
  const shareText = type === 'catalyst' 
    ? t('share.shareTextCatalyst', { title })
    : t('share.shareTextBuilder', { title });

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addNotification(t('share.copySuccess'), t('share.copySuccessMsg'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addNotification(t('share.copyFail'), t('share.copyFailMsg'), 'error');
    }
  };

  const handleShareX = (e: React.MouseEvent) => {
    e.stopPropagation();
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
    addNotification(t('share.sharing'), t('share.openingX'), 'info');
  };

  const handleShareTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
    addNotification(t('share.sharing'), t('share.openingTelegram'), 'info');
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (variant === 'full') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 rounded-xl border border-white/5 bg-[#121622]/40 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-[#121622] hover:text-white transition-all cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-[#ffd285]" />}
          <span>{copied ? t('share.copied') : t('share.copyLink')}</span>
        </button>

        <button
          onClick={handleShareX}
          className="flex items-center space-x-1.5 rounded-xl border border-white/5 bg-[#121622]/40 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-black/60 hover:text-white transition-all hover:border-white/20 cursor-pointer"
        >
          <Twitter className="h-3.5 w-3.5 text-[#ffd285]" />
          <span>{t('share.shareToXShort')}</span>
        </button>

        <button
          onClick={handleShareTelegram}
          className="flex items-center space-x-1.5 rounded-xl border border-white/5 bg-[#121622]/40 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-sky-950/40 hover:text-white hover:border-sky-500/30 transition-all cursor-pointer"
        >
          <Send className="h-3.5 w-3.5 text-sky-400" />
          <span>{t('share.telegram')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center rounded-xl bg-[#121622]/80 p-2.5 border border-white/5 hover:border-[#ffd285]/30 hover:bg-[#121622] text-white/60 hover:text-white transition-all cursor-pointer"
        title={t('share.shareCardTooltip')}
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-[#ffd285]/10 bg-[#0c0e14] p-1.5 shadow-2xl z-50">
            <button
              onClick={handleCopy}
              className="flex w-full items-center space-x-2.5 px-3 py-2 text-left text-xs font-medium text-white/80 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer bg-transparent border-none"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-[#ffd285]" />}
              <span>{copied ? t('share.copiedToast') : t('share.copyDeepLink')}</span>
            </button>

            <button
              onClick={handleShareX}
              className="flex w-full items-center space-x-2.5 px-3 py-2 text-left text-xs font-medium text-white/80 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer bg-transparent border-none"
            >
              <Twitter className="h-3.5 w-3.5 text-[#ffd285]" />
              <span>{t('share.shareToTwitterLong')}</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="flex w-full items-center space-x-2.5 px-3 py-2 text-left text-xs font-medium text-white/80 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer bg-transparent border-none"
            >
              <Send className="h-3.5 w-3.5 text-sky-400" />
              <span>{t('share.shareToTelegramLong')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
