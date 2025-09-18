export function Sidebar() {
  const navItems = [
    { icon: '📊', label: 'Overview', href: '#overview' },
    { icon: '🖥️', label: 'Node Control', href: '#node' },
    { icon: '👛', label: 'Wallets', href: '#wallets' },
    { icon: '📦', label: 'Contracts', href: '#contracts' },
    { icon: '🌐', label: 'Network', href: '#network' },
    { icon: '🔗', label: 'API Integration', href: '#api' },
    { icon: '⚙️', label: 'Settings', href: '#settings' },
    { icon: '📚', label: 'Documentation', href: '#docs' },
  ];

  return (
    <aside className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          {navItems.map((item, index) => (
            <li key={index}>
              <a href={item.href} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p className="sidebar-version">v1.0.0</p>
          <p className="sidebar-status">All systems operational</p>
        </div>
      </div>
    </aside>
  );
}

// Sidebar Footer Styles
const sidebarFooterStyles = `
.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  border-top: 1px solid #4a5568;
  background: #2d3748;
}

.sidebar-info {
  text-align: center;
}

.sidebar-version {
  font-size: 0.75rem;
  color: #a0aec0;
  margin-bottom: 0.25rem;
}

.sidebar-status {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = sidebarFooterStyles;
  document.head.appendChild(styleSheet);
}



