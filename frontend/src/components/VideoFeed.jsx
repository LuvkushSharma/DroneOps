import React, { useRef, useState, useEffect } from 'react';
import { FiMaximize, FiMinimize, FiVideo, FiVideoOff, FiCamera } from 'react-icons/fi';

/**
 * VideoFeed component for displaying drone video stream
 * 
 * @param {Object} props
 * @param {string} props.streamUrl - URL for the video stream
 * @param {boolean} props.isConnected - Whether drone is connected
 * @param {Function} props.onTakeScreenshot - Handler for taking screenshots
 * @param {string} props.className - Additional CSS classes
 */
const VideoFeed = ({
  streamUrl,
  isConnected = false,
  onTakeScreenshot,
  className = ''
}) => {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isStreamMuted, setIsStreamMuted] = useState(true);
  
  // Initialize the video stream when component mounts or when URL changes
  useEffect(() => {
    if (streamUrl && isConnected) {
      setIsStreamActive(true);
      
      // Connect to the stream - implementation will depend on stream type
      // This is a placeholder for actual stream connection logic
      try {
        if (videoRef.current) {
          videoRef.current.src = streamUrl;
          videoRef.current.muted = isStreamMuted;
          videoRef.current.play().catch(err => {
            console.error('Error playing video stream:', err);
            setIsStreamActive(false);
          });
        }
      } catch (err) {
        console.error('Error connecting to video stream:', err);
        setIsStreamActive(false);
      }
    } else {
      setIsStreamActive(false);
    }
    
    return () => {
      // Cleanup function to stop the stream when component unmounts
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [streamUrl, isConnected]);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    const videoElement = document.getElementById('drone-video-container');
    
    if (!document.fullscreenElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if (videoElement.webkitRequestFullscreen) {
        videoElement.webkitRequestFullscreen();
      } else if (videoElement.msRequestFullscreen) {
        videoElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // Toggle stream audio
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isStreamMuted;
      setIsStreamMuted(!isStreamMuted);
    }
  };
  
  // Take a screenshot of the current frame
  const takeScreenshot = () => {
    if (!videoRef.current || !isStreamActive) return;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const screenshotDataUrl = canvas.toDataURL('image/png');
      
      if (onTakeScreenshot) {
        onTakeScreenshot(screenshotDataUrl);
      } else {
        // Default behavior: open in new tab
        const newTab = window.open();
        newTab.document.body.innerHTML = `<img src="${screenshotDataUrl}" alt="Drone Screenshot">`;
      }
    } catch (err) {
      console.error('Error taking screenshot:', err);
    }
  };

  return (
    <div 
      id="drone-video-container"
      className={`bg-gray-900 rounded-lg overflow-hidden relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {isConnected && isStreamActive ? (
        // Video display when connected and active
        <video 
          ref={videoRef}
          className="w-full h-full object-contain"
          muted={isStreamMuted}
          playsInline
          autoPlay
        />
      ) : (
        // Placeholder when no stream is available
        <div className="flex flex-col items-center justify-center h-full p-4 text-gray-400">
          {isConnected ? (
            <>
              <FiVideoOff className="w-12 h-12 mb-2" />
              <p className="text-center">Video stream not available</p>
            </>
          ) : (
            <>
              <FiVideo className="w-12 h-12 mb-2" />
              <p className="text-center">Connect to drone to view video feed</p>
            </>
          )}
        </div>
      )}
      
      {/* Video controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex justify-between items-center">
        <div className="text-white text-sm">
          {isStreamActive ? 'Live Feed' : 'Video Inactive'}
        </div>
        
        <div className="flex space-x-2">
          {isStreamActive && (
            <button
              onClick={takeScreenshot}
              className="p-1.5 rounded-full bg-gray-800 text-white hover:bg-gray-700"
              title="Take Screenshot"
            >
              <FiCamera className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full bg-gray-800 text-white hover:bg-gray-700"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <FiMinimize className="h-4 w-4" />
            ) : (
              <FiMaximize className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;