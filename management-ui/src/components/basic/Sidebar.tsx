import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className="sidebar">
      <h2>TAIHU</h2>
      <nav className="nav">
        <NavLink to="/apps" onClick={handleClick}>Apps</NavLink>
        <NavLink to="/vector-sets" onClick={handleClick}>Vector Sets</NavLink>
        <NavLink to="/datasets" onClick={handleClick}>Datasets</NavLink>
      </nav>
    </aside>
  );
}
