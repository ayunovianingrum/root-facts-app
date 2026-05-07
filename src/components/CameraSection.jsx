import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, ScanLine } from 'lucide-react';
import { TONE_CONFIG, MODEL_STATUS, CAMERA_LABEL } from '../utils/config';

function CameraSection({
  isRunning,
  onToggleCamera,
  onToneChange,
  services,
  modelStatus,
  currentTone,
  appState,
  cameraState,
}) {
  const [selectedCamera, setSelectedCamera] = cameraState;
  const [fps, setFps] = useState(30);
  const [cameraList, setCameraList] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadCameras = async () => {
      if (services.camera) {
        try {
          const cameras = await services.camera.loadCameras();
          setCameraList(cameras);
          if (cameras.length > 0 && !selectedCamera) {
            handleCameraChange(cameras[0].deviceId);
          }
        } catch (error) {
          console.error('Failed to get camera lists:', error);
        }
      }
    };
    loadCameras();
  }, [services.camera]);

  useEffect(() => {
    if (services.camera) {
      if (videoRef.current && !services.camera.video) {
        services.camera.setVideoElement(videoRef.current);
      }
      if (canvasRef.current && !services.camera.canvas) {
        services.camera.setCanvasElement(canvasRef.current);
      }
    }
  });

  useEffect(() => {
    if (services.camera) {
      services.camera.setFPS(fps);
    }
  }, [fps, services.camera]);

  const handleCameraChange = (newCamera) => {
    setSelectedCamera(newCamera);
    if (services.camera && services.camera.isActive()) {
      services.camera.startCamera(newCamera);
    }
  };

  const handleFpsChange = (newFps) => {
    setFps(Number(newFps));
  };

  const handleToneChange = (e) => {
    const newTone = e.target.value;
    if (onToneChange) {
      onToneChange(newTone);
    }
  };

  const isModelReady = modelStatus === MODEL_STATUS.ready;
  const buttonDisabled = !isModelReady;
  const buttonText = isRunning ? 'Stop Scan' : 'Mulai Scan';

  return (
    <section className="camera-section" aria-label="Camera Feed and Controls">
      <div className="camera-container">
        <div className="camera-wrapper">
          <video
            ref={videoRef}
            id="media-video"
            autoPlay
            muted
            playsInline
            className={isRunning ? '' : 'hidden'}
          />

          <canvas ref={canvasRef} id="media-canvas" className="hidden" />

          <div className={`camera-overlay ${isRunning ? 'active' : ''}`}>
            <div className="overlay-wrapper">
              <div className="scan-line" />
              <div className="overlay-frame"> </div>
            </div>
          </div>

          {!isRunning && (
            <div className="camera-placeholder">
              <Camera size={48} />
              <p>{CAMERA_LABEL[appState]}</p>
            </div>
          )}
        </div>

        <div className="camera-controls">
          <button
            id="btn-toggle"
            className={`capture-btn ${isRunning ? 'scanning' : ''}`}
            onClick={onToggleCamera}
            disabled={buttonDisabled}
            aria-label={buttonText}
            style={{ opacity: buttonDisabled ? 0.6 : 1 }}
          >
            <ScanLine size={24} />
          </button>
        </div>

        <div className="settings-bar">
          <div className="setting-item cs-select">
            <Camera size={16} />
            <select
              id="camera-select"
              value={selectedCamera}
              onChange={(e) => handleCameraChange(e.target.value)}
              disabled={isRunning || !cameraList.length}
            >
              {!selectedCamera && (
                <option value="" disabled>
                  {!cameraList.length ? 'No cameras found' : 'Loading...'}
                </option>
              )}
              {cameraList.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item fps-setting">
            <span id="fps-label">{fps} FPS</span>
            <input
              id="fps-slider"
              type="range"
              min="15"
              max="60"
              step="15"
              value={fps}
              onChange={(e) => handleFpsChange(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div className="setting-item cs-select">
            <Mic size={16} />
            <select
              id="tone-select"
              value={currentTone || TONE_CONFIG.defaultTone}
              onChange={handleToneChange}
              disabled={isRunning}
            >
              {TONE_CONFIG.availableTones.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CameraSection;
