export const APP_CONFIG = {
  detectionConfidenceThreshold: 70,
  analyzingDelay: 2000,
  factsGenerationDelay: 2000,
  detectionRetryInterval: 100,
  cameraStartDelay: 1000,
};

export const TENSORFLOW_CONFIG = {
  modelPath: '/model/model.json',
  metadataPath: '/model/metadata.json',
  inputSize: [224, 224],
  normalizationFactor: 255.0,
  confidenceThresholds: {
    excellent: 90,
    good: 70,
  },
};

export const TRANSFORMERS_CONFIG = {
  modelName: 'Xenova/LaMini-Flan-T5-77M',
  maxTokens: 80,
  temperature: 0.4,
  topP: 0.8,
  generationDelay: 500,
  repetitionPenalty: 1.3,
  ngramSize: 3,
};

export const CAMERA_CONFIG = {
  defaultFPS: 30,
  fpsRange: { min: 15, max: 60 },
  desktopResolution: { width: 640, height: 480 },
  mobileResolution: { width: 480, height: 640 },
};

export const TONE_CONFIG = {
  availableTones: [
    { value: 'normal', label: 'Normal' },
    { value: 'funny', label: 'Funny' },
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
  ],
  defaultTone: 'normal',
};

export const TONE_PROMPT_MAP = {
  normal: 'Use a neutral, simple tone.',
  funny: 'Make it playful and slightly humorous.',
  professional: 'Use a formal, informative, and precise tone.',
  casual: 'Use a relaxed, friendly, conversational tone.',
};

export const MODEL_STATUS = {
  preparing: 'Preparing AI model...',
  downloading: 'Downloading AI Model...',
  ready: 'AI model ready',
  error: 'Failed to load model',
};

export const APP_STATUS = {
  idle: 'idle',
  result: 'result',
  analyzing: 'analyzing',
};

export const CAMERA_LABEL = {
  idle: 'Tap scan to start',
  result: 'Ready for another scan',
  analyzing: 'Identifying vegetable...',
};
