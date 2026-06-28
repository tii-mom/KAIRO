import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n } from './useI18n';
import { Locale } from './types';
import { cx } from '../components/runtimeUi';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: Array<{ code: Locale; label: string }> = [
    { code: 'en-US', label: 'EN' },
    { code: 'zh-CN', label: '简中' },
    { code: 'ko-KR', label: '한국어' },
  ];

  const currentLabel = languages.find((l) => l.code === locale)?.label || 'EN';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label={t('common.switchLanguage')}
        className="px-3.5 py-2 font-mono text-[10px] tracking-wider uppercase border border-white/10 rounded hover:border-[#ffb95f]/20 hover:bg-white/[0.03] text-white/60 transition-all duration-200 shrink-0 flex items-center gap-1.5 bg-transparent cursor-pointer"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{currentLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-28 rounded border border-white/10 bg-[#0c0e14] shadow-lg z-50 py-1 font-mono text-[10px]">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => {
                setLocale(code);
                setIsOpen(false);
              }}
              type="button"
              className={cx(
                'w-full text-left px-3 py-2 flex items-center justify-between transition-colors hover:bg-white/[0.04] cursor-pointer',
                code === locale ? 'text-[#ffb95f] font-semibold bg-[#ffb95f]/5' : 'text-white/70'
              )}
            >
              <span>{label}</span>
              {code === locale && <Check className="h-3 w-3 text-[#ffb95f]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
