import {
  CAMERA_CONFIG,
  TENSORFLOW_CONFIG,
  TONE_PROMPT_MAP,
  APP_CONFIG,
} from './config.js';

export const logError = (context, error) => {
  console.error(`❌ ${context}:`, error);
};

export const isWebGPUSupported = async () => {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) return false;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
};

export const isMobileDevice = () => {
  return (
    navigator.userAgentData?.mobile ??
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
};

export const createDelay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const validateModelMetadata = (metadata) => {
  return metadata && metadata.labels && Array.isArray(metadata.labels);
};

export const getCameraConfig = () => {
  const mobile = isMobileDevice();
  return {
    defaultFPS: CAMERA_CONFIG.defaultFPS,
    fpsRange: CAMERA_CONFIG.fpsRange,
    resolution: mobile
      ? CAMERA_CONFIG.mobileResolution
      : CAMERA_CONFIG.desktopResolution,
  };
};

export const getCameraConstraints = (selectedCameraId, fps) => {
  const config = getCameraConfig();
  return {
    video: {
      deviceId: selectedCameraId ? { ideal: selectedCameraId } : undefined,
      width: { ideal: config.resolution.width },
      height: { ideal: config.resolution.height },
      frameRate: { ideal: fps || config.defaultFPS },
    },
  };
};

export const getCameraErrorMessage = (error) => {
  const errorMessages = {
    NotAllowedError: 'Camera access denied. Please enable camera permission.',
    NotFoundError: 'No camera found on this device.',
    NotReadableError: 'Camera is currently in use by another app.',
  };

  return errorMessages[error.name] || 'Unable to open camera';
};

export const createPerformanceResult = (
  operationTime,
  backend,
  averageTime,
  totalOperations,
) => ({
  operationTime: Math.round(operationTime),
  backend: backend,
  averageTime: Math.round(averageTime),
  totalOperations: totalOperations,
});

export const createPerformanceStats = () => ({
  operations: 0,
  totalTime: 0,
  averageTime: 0,
});

export const logPerformance = (backend, operationTime, averageTime) => {
  console.log(
    `⚡ ${backend.toUpperCase()}: ${Math.round(operationTime)}ms (avg: ${Math.round(averageTime)}ms)`,
  );
};

export const updatePerformanceStats = (stats, operationTime) => {
  stats.operations++;
  stats.totalTime += operationTime;
  stats.averageTime = stats.totalTime / stats.operations;
  return stats;
};

export const isValidDetection = (result) => {
  const { detectionConfidenceThreshold } = APP_CONFIG;
  return (
    result &&
    result.isValid &&
    result.confidence >= detectionConfidenceThreshold
  );
};

export const buildPrompt = (vegetableName, tone) => {
  const toneInstruction = TONE_PROMPT_MAP[tone] || TONE_PROMPT_MAP.normal;

  return `Give one interesting food fact about ${vegetableName}. ${toneInstruction}`;
};

export const createModelProgressCallback = (onProgress, throttleMs = 200) => {
  const fileProgress = {};
  let lastMessage = '';
  let lastCallTime = 0;

  return (progress) => {
    if (progress.status !== 'progress' || !progress.file) return;

    const isEncoder = progress.file.includes('encoder');
    const isDecoder = progress.file.includes('decoder');
    if (!isEncoder && !isDecoder) return;

    fileProgress[progress.file] = Math.round(progress.progress);

    const encoderFiles = Object.entries(fileProgress).filter(([file]) =>
      file.includes('encoder'),
    );
    const decoderFiles = Object.entries(fileProgress).filter(([file]) =>
      file.includes('decoder'),
    );

    const average = (entries) => {
      if (entries.length === 0) return 0;
      const sum = entries.reduce((acc, [, val]) => acc + val, 0);
      return Math.round(sum / entries.length);
    };

    const encoder = average(encoderFiles);
    const decoder = average(decoderFiles);
    const message = `Encoder: ${encoder}% | Decoder: ${decoder}%`;

    if (message === lastMessage) return;

    const now = Date.now();
    if (now - lastCallTime < throttleMs) return;
    lastCallTime = now;
    lastMessage = message;

    if (onProgress && typeof onProgress === 'function') {
      onProgress({ status: 'downloading', encoder, decoder, message });
    }
  };
};
