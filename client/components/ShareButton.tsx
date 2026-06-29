import React, { useState } from 'react';
import { Share2, Twitter, Send, Copy, Check } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import { recordShareEvent } from '../lib/api';

interface ShareButtonProps {
  id?: string;
  type: 'catalyst' | 'submission' | 'proof' | 'home';
  title: string;
  variant?: 'compact' | 'full' | 'inline';
  referrerId?: string;
  onShared?: (channel: 'copy' | 'x' | 'telegram', pointsDelta: number) => void;
}

export default function ShareButton({
  id,
  type,
  title,
  variant = 'compact',
  referrerId,
  onShared
}: ShareButtonProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingStatus, setSharingStatus] = useState<string | null>(null);

  const getShareUrl = (channel: 'copy' | 'x' | 'telegram') => {
    const origin = window.location.origin;
    let path = '/';
    if (type === 'catalyst' && id) {
      path = `/catalysts/${id}`;
    } else if (type === 'submission' && id) {
      path = `/submissions/${id}`;
    } else if (type === 'proof' && id) {
      path = `/proof/${id}`;
    }

    const refStr = referrerId ? `ref=${encodeURIComponent(referrerId)}` : '';
    const srcStr = 'source=share';
    const chanStr = `channel=${channel}`;
    const query = [refStr, srcStr, chanStr].filter(Boolean).join('&');

    return `${origin}${path}?${query}`;
  };

  const getShareText = (url: string) => {
    if (type === 'proof') {
      return `${t('beta.shareDescProof')} ${url}`;
    }
    if (type === 'submission') {
      return `${t('beta.shareDescSubmission')} ${title} ${url}`;
    }
    if (type === 'home') {
      return `${t('beta.shareDescHome')} ${url}`;
    }
    // catalyst
    return `${t('beta.shareTextBoosted', { title })} ${url}`;
  };

  const trackShare = async (channel: 'copy' | 'x' | 'telegram') => {
    try {
      const res = await recordShareEvent({
        targetType: type,
        targetId: id,
        channel,
        referrerId,
        source: 'share'
      });
      if (res && typeof res.pointsDelta === 'number') {
        if (onShared) onShared(channel, res.pointsDelta);
        return res.pointsDelta;
      }
    } catch (e) {
      console.warn('Share tracking failed, proceeding silently.', e);
    }
    return 0;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShareUrl('copy');
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setSharingStatus(t('share.copiedToast'));
      setTimeout(() => {
        setCopied(false);
        setSharingStatus(null);
      }, 2000);
      await trackShare('copy');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareX = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShareUrl('x');
    const text = getShareText(url);
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
    await trackShare('x');
  };

  const handleShareTelegram = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShareUrl('telegram');
    const text = getShareText(url);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
    await trackShare('telegram');
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
          type="button"
          className="flex items-center space-x-1.5 rounded-xl border border-white/5 bg-[#121622]/40 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-[#121622] hover:text-white transition-all cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-[#ffd285]" />}
          <span>{copied ? t('share.copied') : t('share.copyLink')}</span>
        </button>

        <button
          onClick={handleShareX}
          type="button"
          className="flex items-center space-x-1.5 rounded-xl border border-white/5 bg-[#121622]/40 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-black/60 hover:text-white transition-all hover:border-white/20 cursor-pointer"
        >
          <Twitter className="h-3.5 w-3.5 text-[#ffd285]" />
          <span>{t('share.shareToXShort')}</span>
        </button>

        <button
          onClick={handleShareTelegram}
          type="button"
          className="flex items-center space-x-1.5 rounded-xl border border-white/5 bg-[#121622]/40 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-sky-950/40 hover:text-white hover:border-sky-500/30 transition-all cursor-pointer"
        >
          <Send className="h-3.5 w-3.5 text-sky-400" />
          <span>{t('share.telegram')}</span>
        </button>

        {sharingStatus && (
          <span className="text-[10px] font-mono text-[#ffb95f] px-2">{sharingStatus}</span>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          type="button"
          className="p-1.5 rounded border border-white/5 bg-[#121622]/50 hover:bg-[#121622] text-white/60 hover:text-[#ffd285] transition-colors cursor-pointer"
          title={t('share.copyLink')}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={handleShareX}
          type="button"
          className="p-1.5 rounded border border-white/5 bg-[#121622]/50 hover:bg-[#121622] text-white/60 hover:text-[#ffd285] transition-colors cursor-pointer"
          title={t('share.shareToXShort')}
        >
          <Twitter className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleShareTelegram}
          type="button"
          className="p-1.5 rounded border border-white/5 bg-[#121622]/50 hover:bg-[#121622] text-white/60 hover:text-[#ffd285] transition-colors cursor-pointer"
          title={t('share.telegram')}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        type="button"
        className="flex items-center justify-center rounded-xl bg-[#121622]/80 p-2.5 border border-white/5 hover:border-[#ffd285]/30 hover:bg-[#121622] text-white/60 hover:text-white transition-all cursor-pointer"
        title={t('share.shareContent')}
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-[#ffd285]/10 bg-[#0c0e14] p-1.5 shadow-2xl z-50">
            <button
              onClick={handleCopy}
              type="button"
              className="flex w-full items-center space-x-2.5 px-3 py-2 text-left text-xs font-medium text-white/80 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer bg-transparent border-none"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-[#ffd285]" />}
              <span>{copied ? t('share.copied') : t('share.copyLink')}</span>
            </button>

            <button
              onClick={handleShareX}
              type="button"
              className="flex w-full items-center space-x-2.5 px-3 py-2 text-left text-xs font-medium text-white/80 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer bg-transparent border-none"
            >
              <Twitter className="h-3.5 w-3.5 text-[#ffd285]" />
              <span>{t('share.shareToXShort')}</span>
            </button>

            <button
              onClick={handleShareTelegram}
              type="button"
              className="flex w-full items-center space-x-2.5 px-3 py-2 text-left text-xs font-medium text-white/80 rounded-lg hover:bg-white/5 hover:text-white transition-all cursor-pointer bg-transparent border-none"
            >
              <Send className="h-3.5 w-3.5 text-sky-400" />
              <span>{t('share.telegram')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
