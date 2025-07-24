// src/components/buttons/ActivationButton.tsx

import { useEffect, useState } from "react";
import type { Status } from "../../types/ui";
import "./ActivationButton.css"; // Assuming you have a CSS file for styles

interface ActivationButtonProps {
  getStatus: () => Promise<Status>;
  onClick: () => Promise<void>;
}

export default function ActivationButton({ getStatus, onClick }: ActivationButtonProps) {
  const [status, setStatus] = useState<Status>("inactive");
  const [hovered, setHovered] = useState(false);

  const updateStatus = async () => {
    try {
      const result = await getStatus();
      setStatus(result);
    } catch (err) {
      console.error("Failed to fetch activation status:", err);
      setStatus("inactive");
    }
  };

  useEffect(() => {
    updateStatus();
  }, []);

  const handleClick = async () => {
    if (status !== "inactive") return;
    await updateStatus(); // check current status before action

    try {
      await onClick();
    } catch (err) {
      console.error("Activation error:", err);
    }

    await updateStatus(); // refresh after action
  };

  const renderLabel = () => {
    if (status === "activating") return <span className="spinner" />;
    if (status === "active") return "Active";
    return hovered ? "Activate" : "Inactive";
  };

  return (
    <button
      className={`activation-button ${status}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={status === "activating"}
    >
      {renderLabel()}
    </button>
  );
}
