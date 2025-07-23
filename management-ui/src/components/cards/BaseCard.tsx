import type { ReactNode } from "react";
import "./BaseCard.css";

interface BaseCardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

export default function BaseCard({ title, description, children, selected = false, onClick }: BaseCardProps) {
  return (
    <div className={`base-card${selected ? " selected" : ""}`} onClick={onClick}>
      <h3>{title}</h3>
      {description && <p className="description">{description}</p>}
      {children}
    </div>
  );
}
