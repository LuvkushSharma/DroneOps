import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiPieChart, FiAirplay, FiMap, 
  FiCpu, FiFilePlus, FiEye, FiGrid, 
  FiChevronRight, FiChevronDown, FiX,
  FiUser, FiLogOut, FiSettings 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isMobile = false, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedSection, setExpandedSection] = useState('');
  
  // Define navItems first before using it in useEffect
  const navItems = [
    {
      section: null,
      items: [
        {
          name: 'Dashboard',
          icon: <FiHome className="w-5 h-5" />,
          path: '/',
          access: ['admin', 'operator', 'viewer']
        }
      ]
    },
    {
      section: 'Drone Management',
      items: [
        {
          name: 'Drone Fleet',
          icon: <FiAirplay className="w-5 h-5" />,
          path: '/drones',
          access: ['admin', 'operator', 'viewer']
        },
        {
          name: 'Add New Drone',
          icon: <FiFilePlus className="w-5 h-5" />,
          path: '/drones/add',
          access: ['admin']
        }
      ]
    },
    {
      section: 'Operations',
      items: [
        {
          name: 'Missions',
          icon: <FiMap className="w-5 h-5" />,
          path: '/missions',
          access: ['admin', 'operator', 'viewer']
        },
        {
          name: 'Mission Planning',
          icon: <FiGrid className="w-5 h-5" />,
          path: '/missions/create',
          access: ['admin', 'operator']
        },
        {
          name: 'Live Monitoring',
          icon: <FiEye className="w-5 h-5" />,
          path: '/missions',
          access: ['admin', 'operator', 'viewer']
        }
      ]
    },
    {
      section: 'Surveys',
      items: [
        {
          name: 'Survey List',
          icon: <FiCpu className="w-5 h-5" />,
          path: '/surveys',
          access: ['admin', 'operator', 'viewer']
        },
        {
          name: 'Create Survey',
          icon: <FiFilePlus className="w-5 h-5" />,
          path: '/surveys/create',
          access: ['admin', 'operator']
        }
      ]
    },
    {
      section: 'Analytics',
      items: [
        {
          name: 'Reports & Statistics',
          icon: <FiPieChart className="w-5 h-5" />,
          path: '/analytics',
          access: ['admin', 'operator', 'viewer']
        }
      ]
    },
    {
      section: 'User',
      items: [
        {
          name: 'Profile Settings',
          icon: <FiUser className="w-5 h-5" />,
          path: '/profile',
          access: ['admin', 'operator', 'viewer']
        },
        {
          name: 'Account Settings',
          icon: <FiSettings className="w-5 h-5" />,
          path: '/settings',
          access: ['admin', 'operator', 'viewer']
        }
      ]
    }
  ];

  // Auto-expand section based on current path when sidebar mounts
  useEffect(() => {
    navItems.forEach(group => {
      if (group.section) {
        const hasActiveItem = group.items.some(
          item => location.pathname.startsWith(item.path)
        );
        if (hasActiveItem) {
          setExpandedSection(group.section);
        }
      }
    });
  }, [location.pathname]);

  // Toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection('');
    } else {
      setExpandedSection(section);
    }
  };

  // Check if a path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Filter items based on user role
  const filterItemsByRole = (items) => {
    if (!user) return [];
    // For testing - temporarily allow all items
    return items;
    // Uncomment this when roles are properly set up
    // return items.filter(item => item.access.includes(user.role));
  };
  
  // Handle navigation manually
  const handleNavigation = (path, e) => {
    e.preventDefault();
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
    navigate(path);
  };

  // Handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
    logout();
    navigate('/login');
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r ${isMobile ? 'w-full' : 'w-64'}`}>
      {/* Mobile header with close button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button 
            onClick={onCloseMobile}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* User profile info */}
      {user && (
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">{user.name || user.email}</p>
              <p className="text-xs text-gray-500 truncate">
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((navGroup, index) => (
          <div key={index} className="mb-4">
            {navGroup.section && (
              <div 
                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-100 rounded-md"
                onClick={() => toggleSection(navGroup.section)}
              >
                <span>{navGroup.section}</span>
                {expandedSection === navGroup.section ? (
                  <FiChevronDown className="w-4 h-4" />
                ) : (
                  <FiChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
            
            <div className={`mt-2 space-y-1 ${navGroup.section && expandedSection !== navGroup.section ? 'hidden' : ''}`}>
              {filterItemsByRole(navGroup.items).map((item, idx) => (
                <a
                  href={item.path}
                  key={idx}
                  onClick={(e) => handleNavigation(item.path, e)}
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-md transition-colors
                    ${isActive(item.path) 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-gray-800 hover:bg-gray-100'}
                  `}
                >
                  <div className={`mr-3 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Logout button at bottom */}
      <div className="border-t p-4">
        <a
          href="#"
          onClick={handleLogout}
          className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-gray-800 hover:bg-red-50 hover:text-red-700"
        >
          <div className="mr-3 text-gray-500">
            <FiLogOut className="w-5 h-5" />
          </div>
          Logout
        </a>
      </div>
    </div>
  );
};

export default Sidebar;