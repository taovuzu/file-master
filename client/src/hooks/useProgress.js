import { useState, useCallback, useRef, useEffect } from 'react';

export const useProgress = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [maxPollingAttempts, setMaxPollingAttempts] = useState(150);
  const abortControllerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastProgressUpdateRef = useRef(0);

  const startProgress = useCallback((initialStep = 'Preparing...') => {
    setProgress(0);
    setStatus('uploading');
    setCurrentStep(initialStep);
    setError(null);
    setStartTime(Date.now());
    setEstimatedTime(null);
    setIsPolling(false);
    setPollingAttempts(0);
    lastProgressUpdateRef.current = Date.now();
    abortControllerRef.current = new AbortController();
  }, []);

  const updateProgress = useCallback((percent, step = null) => {
    const newProgress = Math.min(100, Math.max(0, percent));
    setProgress(newProgress);
    lastProgressUpdateRef.current = Date.now();
    
    if (step) {
      setCurrentStep(step);
    }

    if (newProgress >= 100) {
      setStatus('completed');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else if (newProgress > 0 && status === 'uploading') {
      setStatus('processing');
    }

    if (error && newProgress > 0 && status !== 'error' && status !== 'polling_failed') {
      setError(null);
    }
  }, [status, error]);

  const startSimulatedProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastProgressUpdateRef.current;
      
      if (timeSinceLastUpdate > 10000) {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 3;
          if (newProgress >= 90) {
            return Math.max(48, prev - Math.random() * 5);
          }
          return Math.min(90, newProgress);
        });
      }
    }, 2000);
  }, []);

  const stopSimulatedProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const setProgressError = useCallback((errorMessage) => {
    setError(errorMessage);
    setStatus('error');
    setProgress(0);
    setIsPolling(false);
    stopSimulatedProgress();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [stopSimulatedProgress]);

  const startPolling = useCallback((maxAttempts = 150) => {
    setIsPolling(true);
    setMaxPollingAttempts(maxAttempts);
    setPollingAttempts(0);
    startSimulatedProgress();
  }, [startSimulatedProgress]);

  const updatePollingAttempts = useCallback((attempts) => {
    setPollingAttempts(attempts);
  }, []);

  const setPollingFailed = useCallback((errorMessage = 'Failed to check job status') => {
    setError(errorMessage);
    setStatus('polling_failed');
    setIsPolling(false);

    setProgress(0);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(0);
    setStatus('idle');
    setCurrentStep('');
    setError(null);
    setStartTime(null);
    setEstimatedTime(null);
    setIsPolling(false);
    setPollingAttempts(0);
    stopSimulatedProgress();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [stopSimulatedProgress]);

  useEffect(() => {
    return () => {
      stopSimulatedProgress();
    };
  }, [stopSimulatedProgress]);

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
    isPolling,
    pollingAttempts,
    maxPollingAttempts,
    startProgress,
    updateProgress,
    setProgressError: setProgressError,
    startPolling,
    updatePollingAttempts,
    setPollingFailed,
    resetProgress,
    abort,
    getElapsedTime,
    formatTime,
    isAborted: () => abortControllerRef.current?.signal.aborted || false,
    abortSignal: abortControllerRef.current?.signal
  };
};