import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiBell,
  FiSearch,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiSettings,
  FiHelpCircle
} from 'react-icons/fi';

/**
 * Main navigation bar component for authenticated users
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      message: 'Drone DJI-001 has completed mission',
      time: '10 min ago',
      read: false
    },
    {
      id: 2,
      message: 'Survey "Site Inspection" has been scheduled',
      time: '2 hours ago',
      read: false
    },
    {
      id: 3,
      message: 'Drone DJI-003 battery level is low',
      time: '3 hours ago',
      read: true
    }
  ]);
  
  const location = useLocation();
  const path = location.pathname;

  // Get page title based on current path
  const getPageTitle = () => {
    if (path === '/') return 'Dashboard';
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/drones')) {
      if (path === '/drones') return 'Drones';
      if (path.includes('/add')) return 'Add Drone';
      if (path.includes('/edit')) return 'Edit Drone';
      return 'Drone Details';
    }
    if (path.startsWith('/missions')) {
      if (path === '/missions') return 'Missions';
      if (path.includes('/create')) return 'Create Mission';
      if (path.includes('/edit')) return 'Edit Mission';
      return 'Mission Details';
    }
    if (path === '/monitor') return 'Mission Monitor';
    if (path.startsWith('/surveys')) {
      if (path === '/surveys') return 'Surveys';
      if (path.includes('/create')) return 'Create Survey';
      if (path.includes('/edit')) return 'Edit Survey';
      return 'Survey Details';
    }
    if (path.startsWith('/analytics')) {
      if (path === '/analytics') return 'Analytics';
      return 'Survey Analytics';
    }
    return '';
  };

  const handleLogout = async () => {
    await logout();
    // Navigation is handled by the auth context through protected routes
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Page title and mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-gray-800 ml-2 md:ml-0">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right side - Search, Notifications, Profile */}
          <div className="flex items-center">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search"
                  type="search"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="relative ml-4">
              <button
                className="p-2 bg-white rounded-full text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 relative"
                onClick={toggleNotifications}
              >
                <span className="sr-only">View notifications</span>
                <FiBell className="h-6 w-6" aria-hidden="true" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </button>

              {/* Notifications dropdown */}
              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <a
                          key={notification.id}
                          href="#"
                          className={`block px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <span className={`inline-flex h-8 w-8 rounded-full ${!notification.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} items-center justify-center`}>
                                <FiBell className="h-5 w-5" />
                              </span>
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="border-t border-gray-100 p-2">
                      <button className="w-full px-4 py-2 text-sm text-center text-primary-600 hover:text-primary-700">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="ml-4 relative">
              <button
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={toggleProfileDropdown}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:block ml-2 text-sm font-medium text-gray-700">
                  {user?.name || user?.email || 'User'}
                </span>
              </button>
              
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-700">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FiUser className="mr-3 h-4 w-4 text-gray-500" />
                      Your Profile
                    </div>
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FiSettings className="mr-3 h-4 w-4 text-gray-500" />
                      Settings
                    </div>
                  </Link>
                  <Link
                    to="/help"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <FiHelpCircle className="mr-3 h-4 w-4 text-gray-500" />
                      Help & Support
                    </div>
                  </Link>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <FiLogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="block px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search"
                  type="search"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;