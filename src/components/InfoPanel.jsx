import {
  Sparkles,
  Search,
  CheckCircle,
  Lightbulb,
  Copy,
  Share2,
} from 'lucide-react';

function InfoPanel({
  appState,
  detectionResult,
  funFactData,
  error,
  onCopyFact,
  copyFeedback,
  onRetry,
}) {
  const isIdle = appState === 'idle';
  const isAnalyzing = appState === 'analyzing';
  const isResult = appState === 'result';

  const renderIdleState = () => (
    <div id="state-idle" className="result-card idle-card">
      <div className="idle-icon">
        <Sparkles size={40} />
      </div>
      <h2>Scan Vegetable</h2>
      <p>
        Tap the scan button above to get started and discover interesting facts
        about vegetables!
      </p>
      {error?.type === 'init' && (
        <button className="reload-model-btn" onClick={onRetry}>
          Try to Reload Model
        </button>
      )}
    </div>
  );

  const renderAnalyzingState = () => (
    <div id="state-loading" className="result-card loading-card">
      <div className="loading-animation">
        <div className="loading-ring"></div>
        <div className="loading-icon">
          <Search size={24} />
        </div>
      </div>
      <h2>Analyzing...</h2>
      <p>Identifying your vegetable...</p>
    </div>
  );

  const renderResultState = () => {
    if (!detectionResult) return null;

    const confidence = Math.round(detectionResult.score * 100);

    const renderFunFactContent = () => {
      if (funFactData === null) {
        return (
          <div id="fun-fact-loading" className="fun-fact-loading">
            <div className="fun-fact-loading-spinner"></div>
            <span>Loading interesting facts...</span>
          </div>
        );
      }

      if (funFactData === 'error') {
        return (
          <div
            style={{
              padding: '0.75rem',
              background: '#fef3c7',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              color: '#92400e',
            }}
          >
            Failed to generate interesting facts. Offline mode or service
            unavailable.
          </div>
        );
      }

      return funFactData;
    };

    return (
      <div id="state-result" className="result-card result-main">
        <div className="detected-badge">
          <CheckCircle size={14} />
          <span id="detected-name">{detectionResult.className}</span>
        </div>

        <div className="fun-fact-card">
          <div className="fun-fact-icon">
            <Lightbulb size={28} />
          </div>
          <div id="fun-fact-content">
            <div id="fun-fact-text" className="fun-fact-text">
              {renderFunFactContent()}
            </div>
            {funFactData && funFactData !== 'error' && (
              <button
                id="btn-copy"
                className="copy-btn"
                onClick={onCopyFact}
                title="Salin fakta"
              >
                <Copy size={18} />
              </button>
            )}
          </div>
          <p
            className={`copy-feedback ${!copyFeedback.status ? 'feedback-hidden' : ''} ${copyFeedback.status === 'error' ? 'feedback-error' : ''}`}
          >
            {copyFeedback.message}
          </p>
        </div>

        <div className="confidence-bar">
          <span className="confidence-label">Confidence Score</span>
          <div className="confidence-track">
            <div
              id="confidence-fill"
              className="confidence-fill"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
          <span id="detected-confidence" className="confidence-value">
            {confidence}%
          </span>
        </div>

        <div className="share-hint">
          <Share2 size={14} />
          <span>Copy and share with your friends!</span>
        </div>
      </div>
    );
  };

  return (
    <section className="results-section" aria-live="polite">
      {isIdle && renderIdleState()}
      {isAnalyzing && renderAnalyzingState()}
      {isResult && renderResultState()}
    </section>
  );
}

export default InfoPanel;
