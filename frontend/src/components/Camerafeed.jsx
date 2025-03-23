import { useState, useEffect, useRef } from 'react';

const CameraFeed = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const frameCounter = useRef(1); // Persist counter across renders

  const startCamera = async () => {
    try {
      setLoading(true);
      setStatus('idle');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOn(true);
      setError(null);
    } catch (err) {
      setError('Error accessing the camera. Please ensure camera permissions are granted.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    frameCounter.current = 1; // Reset counter when camera stops
    setStatus('idle');
  };

  const captureAndSendFrame = async () => {
    if (!videoRef.current || !canvasRef.current || isSending) return;

    setIsSending(true);
    setStatus('processing');
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 1);
      });

      const frameName = `frame${frameCounter.current}.jpg`; // Dynamic filename
      frameCounter.current += 1; // Increment counter

      const formData = new FormData();
      formData.append('image', blob, frameName);

      const response = await fetch('http://localhost:3000/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      setStatus('success');
    } catch (err) {
      console.error('Error sending frame:', err);
      setError('Error sending image to server: ' + err.message);
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const toggleCamera = () => (isCameraOn ? stopCamera() : startCamera());

  // Send 2 photos per second 
  useEffect(() => {
    let interval;
    if (isCameraOn) {
      interval = setInterval(captureAndSendFrame, 500);
    }
    return () => clearInterval(interval);
  }, [isCameraOn]);

  useEffect(() => () => stopCamera(), []);

  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-bold mb-6 text-center">Attendance Camera</h2>
          
          <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-100">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100">
                <p className="text-red-600 text-center p-4">{error}</p>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
              aria-label="Live camera feed"
            />
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white ${getStatusColor()} transition-colors duration-300`}>
              {status === 'idle' && 'Ready'}
              {status === 'processing' && 'Processing...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Error'}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={toggleCamera}
              className={`px-8 py-4 rounded-lg shadow-lg transition-all duration-300 text-lg font-semibold ${
                isCameraOn
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              aria-label="Toggle camera"
            >
              {isCameraOn ? 'Stop Camera' : 'Start Camera'}
            </button>
          </div>

          <div className="mt-6 text-center text-gray-600">
            <p className="text-sm">
              {isCameraOn
                ? 'Camera is active. The system will automatically capture and process frames.'
                : 'Click the button above to start the camera and begin attendance tracking.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;