import { Sprout } from 'lucide-react';
import { MODEL_STATUS } from '../utils/config';

function Header({ modelStatus }) {
  const isModelReady = modelStatus === MODEL_STATUS.ready;

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Sprout size={20} />
          <span>RootFacts</span>
        </div>

        <div className="status-pill">
          <span className={`status-dot ${isModelReady ? 'active' : ''}`}></span>
          <span>{modelStatus}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
