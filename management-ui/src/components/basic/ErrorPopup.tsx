// src/components/basic/ErrorPopup.tsx
import './ErrorPopup.css';

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

export default function ErrorPopup({ message, onClose }: ErrorPopupProps) {
  return (
    <div className="error-popup">
      <div className="error-box">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
