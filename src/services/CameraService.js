import {
  logError,
  getCameraConfig,
  getCameraConstraints,
  getCameraErrorMessage,
} from '../utils/common.js';
import { CAMERA_CONFIG } from '../utils/config.js';

export class CameraService {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.config = getCameraConfig();
    this.fps = CAMERA_CONFIG.defaultFPS;
  }

  setVideoElement(videoElement) {
    this.video = videoElement;
  }

  setCanvasElement(canvasElement) {
    this.canvas = canvasElement;
  }

  async loadCameras() {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === 'videoinput');

      tempStream.getTracks().forEach((track) => track.stop());

      if (cameras.length === 0) {
        logError(
          'No camera found',
          new Error(
            'No video input device detected. Please ensure a camera is available.',
          ),
        );
        return [];
      }

      return cameras.map((camera, index) => ({
        deviceId: camera.deviceId,
        label: camera.label || `Kamera ${index + 1}`,
      }));
    } catch (error) {
      logError('Unable to load camera', error);
      throw new Error(`Camera access failed: ${error.message}`);
    }
  }

  async startCamera(selectedCameraId) {
    try {
      this.stopCamera();

      const constraints = getCameraConstraints(selectedCameraId, this.fps);
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.video) {
        this.video.srcObject = this.stream;
        await this.video.play();
      }

      return true;
    } catch (error) {
      logError('Unable to open camerta', error);
      const errorMessage = getCameraErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;

      if (this.video) {
        this.video.srcObject = null;
      }
    }
  }

  setFPS(fps) {
    const { fpsRange } = this.config;
    if (fps < fpsRange.min || fps > fpsRange.max) {
      logError(
        'FPS tidak valid',
        new Error(`FPS harus antara ${fpsRange.min} dan ${fpsRange.max}`),
      );
      return;
    }

    this.fps = fps;
  }

  isActive() {
    return this.stream && this.stream.active;
  }

  isReady() {
    return (
      this.isActive() &&
      this.video &&
      this.video.readyState >= 2 &&
      !this.video.paused
    );
  }

  captureFrame() {
    if (!this.isReady() || !this.canvas) {
      return null;
    }

    const ctx = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    ctx.drawImage(this.video, 0, 0);

    return this.canvas;
  }
}
