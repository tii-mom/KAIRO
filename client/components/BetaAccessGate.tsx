import React, { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import { ActionButton, FormField } from './runtimeUi';

const apiEnv = (import.meta as unknown as { env?: { VITE_KAIRO_API_BASE_URL?: string } }).env ?? {};

interface BetaAccessGateProps {
  onSuccess?: () => void;
}

export default function BetaAccessGate({ onSuccess }: BetaAccessGateProps) {
  const { t } = useI18n();
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const checkToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setIsVerifying(true);
    setMsg(null);
    setStatus('idle');

    try {
      const baseUrl = apiEnv.VITE_KAIRO_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/beta/write-check`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-kairo-beta-token': token.trim(),
        },
      });

      if (response.ok) {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('x-kairo-beta-token', token.trim());
        }
        setStatus('success');
        setMsg(t('beta.successToast'));
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1000);
        }
      } else {
        setStatus('error');
        setMsg(t('beta.invalidToast'));
      }
    } catch (err) {
      setStatus('error');
      setMsg(t('common.apiError'));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="glass-panel p-6 border-[#EE1C25]/20 bg-[#EE1C25]/5 rounded-xl space-y-4 max-w-md mx-auto">
      <div className="flex items-center gap-2 text-[#EE1C25] font-bold">
        <ShieldAlert className="h-5 w-5 animate-pulse" />
        <span className="text-sm font-mono uppercase tracking-wider">
          {t('beta.audienceScope')}
        </span>
      </div>
      <p className="text-xs text-white/70 leading-relaxed font-mono">
        {t('beta.verifyDesc')}
      </p>

      <form onSubmit={checkToken} className="space-y-4">
        <FormField
          name="betaToken"
          label={t('beta.tokenInput')}
          placeholder={t('beta.tokenInputPlaceholder')}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <div className="flex items-center gap-3">
          <ActionButton
            type="submit"
            disabled={isVerifying}
            tone="ignite"
            className="w-full text-xs font-bold uppercase tracking-wider py-2"
          >
            {isVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin inline mr-1.5" /> : null}
            {t('beta.verifyButton')}
          </ActionButton>
        </div>
      </form>

      {msg && (
        <div className={`p-3 rounded border text-xs font-mono ${
          status === 'success' 
            ? 'border-[#4ade80]/20 bg-[#4ade80]/5 text-[#4ade80]' 
            : 'border-[#EE1C25]/20 bg-[#EE1C25]/5 text-[#EE1C25]'
        }`}>
          {msg}
        </div>
      )}
    </div>
  );
}
