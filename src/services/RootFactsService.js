import { TONE_CONFIG, TRANSFORMERS_CONFIG } from '../utils/config.js';
import {
  buildPrompt,
  createDelay,
  isWebGPUSupported,
  logError,
  updatePerformanceStats,
  logPerformance,
  createPerformanceResult,
  createModelProgressCallback,
  createPerformanceStats,
} from '../utils/common.js';
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.allowRemoteModels = true;

export class RootFactsService {
  constructor(onProgress = null) {
    this.generator = null;
    this.isModelLoaded = false;
    this.isGenerating = false;
    this.currentBackend = null;
    this.config = TRANSFORMERS_CONFIG;
    this.currentTone = TONE_CONFIG.defaultTone;
    this.performanceStats = createPerformanceStats();
    this.onProgress = onProgress;
  }

  async loadModel() {
    if (this.isModelLoaded) return;
    try {
      const device = (await isWebGPUSupported()) ? 'webgpu' : 'wasm';

      this.generator = await pipeline(
        'text2text-generation',
        this.config.modelName,
        {
          dtype: 'q4',
          device,
          progress_callback: createModelProgressCallback(this.onProgress),
        },
      );

      this.isModelLoaded = true;
      this.currentBackend = device;

      return {
        success: true,
        model: this.config.modelName,
        backend: this.currentBackend,
      };
    } catch (error) {
      this.isModelLoaded = false;
      logError('Model load failed (TransformersJS)', error);
      throw new Error(
        `Content generation model failed to load: ${error.message}`,
      );
    }
  }

  setTone(tone) {
    this.currentTone = tone;
  }

  async generateFacts(vegetableName) {
    if (!this.isModelLoaded || this.isGenerating) {
      throw new Error('Model is not ready or is currently generating content');
    }

    if (!vegetableName || typeof vegetableName !== 'string') {
      throw new Error('Please enter a valid vegetable name');
    }

    try {
      this.isGenerating = true;
      const startTime = performance.now();

      await createDelay(this.config.generationDelay);
      const prompt = buildPrompt(vegetableName, this.currentTone);

      const result = await this.generator(prompt, {
        max_new_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        do_sample: true,
        top_p: this.config.topP,
        repetition_penalty: this.config.repetitionPenalty,
        no_repeat_ngram_size: this.config.ngramSize,
      });

      const endTime = performance.now();
      const generationTime = endTime - startTime;

      updatePerformanceStats(this.performanceStats, generationTime);

      const generatedText = result[0].generated_text;

      logPerformance(
        this.currentBackend,
        generationTime,
        this.performanceStats.averageTime,
      );

      return {
        nutritionFact: generatedText.trim(),
        generated: true,
        source: 'AI-generated content',
        performance: createPerformanceResult(
          generationTime,
          this.currentBackend,
          this.performanceStats.averageTime,
          this.performanceStats.operations,
        ),
      };
    } catch (error) {
      logError('Error generating fun fact content', error);
      throw new Error(
        `Couldn't generate fun fact information: ${error.message}`,
      );
    } finally {
      this.isGenerating = false;
    }
  }

  isReady() {
    return this.isModelLoaded && !this.isGenerating;
  }
}
