import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isCommercial = user?.role === "restaurant" || user?.role === "ngo";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navbarStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    padding: '14px 32px',
    borderBottom: '1px solid rgba(184, 160, 201, 0.2)',
    background: 'rgba(245, 240, 235, 0.88)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    transition: 'all 0.3s ease',
  };

  const brandStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    fontWeight: 400,
    fontSize: '1.2rem',
    letterSpacing: '-0.01em',
    color: '#2D1B3D',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  };

  const logoStyles = {
    height: '44px',
    width: 'auto',
    display: 'block',
  };

  const linksStyles = {
    display: 'flex',
    gap: '4px',
    flex: 1,
    marginLeft: '16px',
  };

  const linkStyles = {
    padding: '8px 16px',
    borderRadius: '6px',
    color: '#4A4050',
    fontWeight: 400,
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    position: 'relative',
  };

  const activeLinkStyles = {
    ...linkStyles,
    color: '#4A2B5E',
    background: 'rgba(74, 43, 94, 0.06)',
  };

  const actionsStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const userStyles = {
    fontSize: '0.78rem',
    color: '#4A4050',
    fontWeight: 350,
    padding: '6px 12px',
    background: 'rgba(184, 160, 201, 0.1)',
    borderRadius: '6px',
    letterSpacing: '0.01em',
  };

  const userRoleStyles = {
    color: '#7B5B9A',
    fontWeight: 400,
  };

  const buttonStyles = {
    padding: '8px 18px',
    borderRadius: '6px',
    border: '1.5px solid rgba(184, 160, 201, 0.3)',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 400,
    color: '#4A4050',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  };

  const primaryButtonStyles = {
    ...buttonStyles,
    background: 'linear-gradient(135deg, #4A2B5E, #7B5B9A)',
    color: 'white',
    border: 'none',
    fontWeight: 500,
    boxShadow: '0 2px 12px rgba(74, 43, 94, 0.15)',
  };

  return (
    <header style={navbarStyles}>
      <NavLink to="/" style={brandStyles}>
        <img src="/logo.png" alt="WasteNot Logo" style={logoStyles} />
       
      </NavLink>

      {user && (
        <nav style={linksStyles}>
          {!isCommercial && (
            <>
              <NavLink 
                to="/dashboard" 
                style={({ isActive }) => isActive ? activeLinkStyles : linkStyles}
              >
                Shelf
              </NavLink>
              <NavLink 
                to="/recipes" 
                style={({ isActive }) => isActive ? activeLinkStyles : linkStyles}
              >
                Recipes
              </NavLink>
            </>
          )}
          {isCommercial && (
            <NavLink 
              to="/donations" 
              style={({ isActive }) => isActive ? activeLinkStyles : linkStyles}
            >
              Surplus
            </NavLink>
          )}
        </nav>
      )}

      <div style={actionsStyles}>
        {user ? (
          <>
            <span style={userStyles}>
              {user.name.split(" ")[0]}
            </span>
            <button 
              style={buttonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(74, 43, 94, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(123, 91, 154, 0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(184, 160, 201, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={handleLogout}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink 
              to="/login" 
              style={buttonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(74, 43, 94, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(123, 91, 154, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(184, 160, 201, 0.3)';
              }}
            >
              Log in
            </NavLink>
            <NavLink 
              to="/signup" 
              style={primaryButtonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(74, 43, 94, 0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(74, 43, 94, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Get started
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}