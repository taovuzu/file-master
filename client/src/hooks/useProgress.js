import { useState, useCallback, useRef } from 'react';

export const useProgress = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle', 'uploading', 'processing', 'completed', 'error'
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const abortControllerRef = useRef(null);

  const startProgress = useCallback((initialStep = 'Preparing...') => {
    setProgress(0);
    setStatus('uploading');
    setCurrentStep(initialStep);
    setError(null);
    setStartTime(Date.now());
    setEstimatedTime(null);
    abortControllerRef.current = new AbortController();
  }, []);

  const updateProgress = useCallback((percent, step = null) => {
    setProgress(Math.min(100, Math.max(0, percent)));
    if (step) {
      setCurrentStep(step);
    }
    
    // Update status based on progress
    if (percent >= 100) {
      setStatus('completed');
    } else if (percent > 0 && status === 'uploading') {
      setStatus('processing');
    }
  }, [status]);

  const setProgressError = useCallback((errorMessage) => {
    setError(errorMessage);
    setStatus('error');
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(0);
    setStatus('idle');
    setCurrentStep('');
    setError(null);
    setStartTime(null);
    setEstimatedTime(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('error');
    setProgressError('Operation cancelled');
  }, [setProgressError]);

  const getElapsedTime = useCallback(() => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  }, [startTime]);

  const formatTime = useCallback((seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  return {
    progress,
    status,
    currentStep,
    error,
    startTime,
    estimatedTime,
    startProgress,
    updateProgress,
    setProgressError: setProgressError,
    resetProgress,
    abort,
    getElapsedTime,
    formatTime,
    isAborted: () => abortControllerRef.current?.signal.aborted || false,
    abortSignal: abortControllerRef.current?.signal,
  };
};
