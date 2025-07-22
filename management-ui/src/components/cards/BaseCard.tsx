import type { ReactNode } from "react";
import "./BaseCard.css";

interface BaseCardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export default function BaseCard({ title, description, children, onClick }: BaseCardProps) {
  return (
    <div className="base-card" onClick={onClick}>
      <h3>{title}</h3>
      {description && <p className="description">{description}</p>}
      {children}
    </div>
  );
}
