import React, { useEffect, useState } from 'react';
import { Lock, Play } from 'lucide-react';
import { useGame } from '../../hooks/useGame';

interface PrisonOverlayProps {
  releaseTime: number | string | Date;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function PrisonOverlay({ releaseTime }: PrisonOverlayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const { skipPrison } = useGame();

  useEffect(() => {
    const releaseTimestamp = typeof releaseTime === 'number'
      ? releaseTime
      : new Date(releaseTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, releaseTimestamp - now);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        window.location.reload();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [releaseTime]);

  const handleWatchAd = async () => {
    setIsLoadingAd(true);

    try {
      // Initialize the ad
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "ca-pub-8529996803265677",
        enable_page_level_ads: true,
        overlays: {
          bottom: true,
        },
        reward: {
          adUnitId: "ca-pub-8529996803265677/1880912165",
          onRewarded: async () => {
            await skipPrison();
            window.location.reload();
          },
        },
      });
    } catch (error) {
      console.error('Failed to load ad:', error);
    } finally {
      setIsLoadingAd(false);
    }
  };

  const formatTime = (ms: number): string => {
    if (ms <= 0) return '0:00';

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-red-500">You're in Prison!</h2>
        <p className="text-gray-400">
          Your mission failed and you got caught. You'll be released in:
        </p>
        <div className="text-4xl font-mono text-red-400">
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={handleWatchAd}
          disabled={isLoadingAd}
          className={`
            flex items-center justify-center space-x-2 mx-auto
            px-6 py-3 rounded-lg text-white font-medium
            ${isLoadingAd
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 transition-colors'}
          `}
        >
          <Play className="w-5 h-5" />
          <span>{isLoadingAd ? 'Loading...' : 'Watch Ad to Skip'}</span>
        </button>
      </div>
    </div>
  );
}
