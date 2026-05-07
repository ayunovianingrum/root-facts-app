import { useRef, useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CameraSection from './components/CameraSection';
import InfoPanel from './components/InfoPanel';
import { useAppState } from './hooks/useAppState';
import { DetectionService } from './services/DetectionService';
import { CameraService } from './services/CameraService';
import { RootFactsService } from './services/RootFactsService';
import { createDelay, isValidDetection } from './utils/common';
import {
  APP_CONFIG,
  MODEL_STATUS,
  TONE_CONFIG,
  APP_STATUS,
} from './utils/config';

function App() {
  const { state, actions } = useAppState();
  const detectionCleanupRef = useRef(null);
  const isRunningRef = useRef(false);
  const timeoutRef = useRef(null);
  const hasInit = useRef(false);
  const [copyFeedback, setCopyFeedback] = useState({ message: '', status: '' });
  const [currentTone, setCurrentTone] = useState(TONE_CONFIG.defaultTone);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;

    const init = async () => {
      try {
        actions.setModelStatus(MODEL_STATUS.preparing);
        actions.setError({
          type: '',
          message: '',
        });

        const detector = new DetectionService();
        await detector.loadModel();

        const camera = new CameraService();

        const generator = new RootFactsService((progress) => {
          actions.setModelStatus(
            `${MODEL_STATUS.preparing} ${progress.message}`,
          );
        });
        await generator.loadModel();

        actions.setServices({ detector, camera, generator });
        actions.setModelStatus(MODEL_STATUS.ready);
      } catch (error) {
        hasInit.current = false;
        actions.setModelStatus(MODEL_STATUS.error);
        actions.setError({
          type: 'init',
          message: `Failed to initialize: ${error.message}`,
        });
      }
    };

    init();
  }, [retryCount]);

  const startDetection = useCallback(() => {
    let animationId = null;
    let isActive = true;

    const detectLoop = async () => {
      if (!isActive) {
        return;
      }
      if (!isRunningRef.current) {
        setTimeout(() => {
          if (isActive) {
            animationId = requestAnimationFrame(detectLoop);
          }
        }, APP_CONFIG.detectionRetryInterval);
        return;
      }

      try {
        const canvas = state.services.camera.captureFrame();
        if (!canvas) {
          if (isActive && isRunningRef.current) {
            animationId = requestAnimationFrame(detectLoop);
          }
          return;
        }

        const result = await state.services.detector.predict(canvas);

        if (isValidDetection(result)) {
          isActive = false;
          isRunningRef.current = false;
          actions.setRunning(false);
          actions.setAppState(APP_STATUS.analyzing);
          state.services.camera?.stopCamera();

          await createDelay(APP_CONFIG.analyzingDelay);

          actions.setDetectionResult(result);
          actions.setAppState(APP_STATUS.result);
          actions.setFunFactData(null);

          if (state.services.generator?.isReady()) {
            await createDelay(APP_CONFIG.factsGenerationDelay);
            try {
              const factsResult = await state.services.generator.generateFacts(
                result.className,
              );
              actions.setFunFactData(factsResult.nutritionFact);
            } catch (nutritionError) {
              console.error(
                '❌ Failed to generate fun facts content',
                nutritionError,
              );
              actions.setFunFactData('error');
            }
          } else {
            actions.setFunFactData('error');
          }
          return;
        }
      } catch (error) {
        console.error('❌ Detection error', error);
        actions.setError({
          type: 'detect',
          message: `Failed to detect: ${error.message}`,
        });
      }

      if (isActive && isRunningRef.current) {
        animationId = requestAnimationFrame(detectLoop);
      }
    };

    detectLoop();

    return () => {
      isActive = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [state.services, actions]);

  const startCamera = async () => {
    try {
      actions.resetResults();

      isRunningRef.current = true;
      actions.setRunning(true);
      actions.setAppState(APP_STATUS.analyzing);

      await state.services.camera?.startCamera(selectedCamera);
      await createDelay(APP_CONFIG.cameraStartDelay);

      const cleanup = startDetection();
      detectionCleanupRef.current = cleanup;
    } catch (error) {
      console.error('❌ Failed to open camera', error);
      isRunningRef.current = false;
      actions.setRunning(false);
      actions.setAppState(APP_STATUS.idle);
      throw error;
    }
  };

  const stopCamera = () => {
    if (detectionCleanupRef.current) {
      detectionCleanupRef.current();
      detectionCleanupRef.current = null;
    }

    isRunningRef.current = false;
    actions.setRunning(false);
    actions.setAppState(APP_STATUS.idle);
    state.services.camera?.stopCamera();
    actions.resetResults();
  };

  const handleToggleCamera = useCallback(async () => {
    if (!state.services.detector?.isLoaded()) {
      actions.setError({
        type: 'preparing',
        message:
          'AI detection model is not ready. Please wait for initialization to finish',
      });
      return;
    }

    try {
      actions.setError({ type: '', message: '' });
      if (!isRunningRef.current) {
        await startCamera(selectedCamera);
      } else {
        stopCamera();
      }
    } catch (error) {
      console.error('❌ Camera toggle error:', error);
      actions.setError({
        type: 'camera',
        message: `Failed to detect: ${error.message}`,
      });
    }
  }, [state.services.detector, actions, startCamera, isRunningRef]);

  const handleTone = useCallback(
    (tone) => {
      state.services.generator?.setTone(tone);
      setCurrentTone(tone);
    },
    [state.services.generator],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.funFactData);
      setCopyFeedback({ message: 'Copied!', status: 'success' });
    } catch {
      setCopyFeedback({ message: 'Failed to copy', status: 'error' });
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setCopyFeedback({ message: '', status: '' });
    }, 2000);
  };

  const onCloseToast = () => {
    actions.setError({ type: '', message: '' });
  };

  const onRetry = () => setRetryCount((c) => c + 1);

  return (
    <div className="app-container">
      <Header modelStatus={state.modelStatus} />

      <main className="main-content">
        <CameraSection
          isRunning={state.isRunning}
          services={state.services}
          modelStatus={state.modelStatus}
          currentTone={currentTone}
          onToggleCamera={handleToggleCamera}
          appState={state.appState}
          onToneChange={handleTone}
          cameraState={[selectedCamera, setSelectedCamera]}
        />

        <InfoPanel
          appState={state.appState}
          detectionResult={state.detectionResult}
          funFactData={state.funFactData}
          error={state.error}
          copyFeedback={copyFeedback}
          onCopyFact={handleCopy}
          onRetry={onRetry}
        />
      </main>

      <footer className="footer">
        <p>Powered by TensorFlow.js & Transformers.js</p>
      </footer>

      {state.error.message && (
        <div className="error-toast">
          <strong>Error:</strong> {state.error.message}
          {state.error.type !== 'init' && (
            <button className="close-icon-toast" onClick={onCloseToast}>
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
