import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from "@auth0/auth0-react";

const CameraFeed = () => {
  // --- Existing State ---
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { user, isAuthenticated } = useAuth0();

  // --- New/Modified State for Manual Capture ---
  const [status, setStatus] = useState('idle'); // idle, capturing, success, error
  const [isCapturingSequence, setIsCapturingSequence] = useState(false); // Is the 5-photo sequence running?
  const [captureCount, setCaptureCount] = useState(0); // How many photos captured in the current sequence (0-5)

  // Start Camera Function (mostly unchanged)
  const startCamera = async () => {
    // Reset states related to capture sequence when starting camera
    setStatus('idle');
    setCaptureCount(0);
    setIsCapturingSequence(false);
    setError(null);
    setLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError('Error accessing the camera. Please ensure camera permissions are granted.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Stop Camera Function (resets capture state)
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setStatus('idle'); // Reset status
    setCaptureCount(0); // Reset count
    setIsCapturingSequence(false); // Ensure sequence stops
    setError(null); // Clear any errors
  };

  // Function to capture and send a SINGLE frame (called by the sequence function)
  const captureSingleFrame = async (frameNumberInSequence) => {
    // Ensure refs are valid
    if (!videoRef.current || !canvasRef.current) {
        console.error('Video or Canvas ref not available.');
        setError('Camera feed or canvas not ready.');
        return false; // Indicate failure
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Ensure video dimensions are valid before drawing
    if (!video.videoWidth || !video.videoHeight) {
        console.error('Video dimensions not available yet.');
        setError('Video stream not fully loaded.');
        return false; // Indicate failure
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Get blob from canvas
      const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((blobResult) => {
              if (blobResult) {
                  resolve(blobResult);
              } else {
                  reject(new Error('Canvas toBlob returned null.'));
              }
          }, 'image/jpeg', 0.9); // Use quality 0.9 for slightly smaller files
      });

      // Create unique frame name
      const frameName = isAuthenticated
        ? `${user.nickname}${frameNumberInSequence}.jpg`
        : `unknown${frameNumberInSequence}.jpg`;

      // Prepare form data
      const formData = new FormData();
      formData.append('image', blob, frameName);

      // Send POST request
      const response = await fetch('http://localhost:3000/api/uploads', {
        method: 'POST',
        body: formData,
        // Note: Don't set 'Content-Type': 'multipart/form-data' manually.
        // The browser sets it correctly with the boundary when using FormData.
      });

      // Check response status
      if (!response.ok) {
        const errorBody = await response.text(); // Try to get more error details
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      const result = await response.json();
      console.log(`Upload successful (${frameNumberInSequence}/5):`, result);
      return true; // Indicate success

    } catch (err) {
      console.error(`Error sending frame ${frameNumberInSequence}/5:`, err);
      // Set specific error for this frame failure
      setError(`Error sending image ${frameNumberInSequence}/5: ${err.message}`);
      return false; // Indicate failure
    }
  };

  // --- New Function: Start the 5-photo capture sequence ---
  const startCaptureSequence = async () => {
    if (!isCameraOn || isCapturingSequence) return; // Only run if camera is on and not already capturing

    setIsCapturingSequence(true);
    setCaptureCount(0); // Start count from 0
    setError(null); // Clear previous errors
    setStatus('capturing');

    let successfulCaptures = 0;

    for (let i = 1; i <= 5; i++) {
      setCaptureCount(i); // Update count *before* capture for immediate UI feedback (Capturing 1/5...)
      console.log(`Attempting to capture frame ${i}/5...`);

      const success = await captureSingleFrame(i);

      if (success) {
        successfulCaptures++;
        // Optional short delay between captures if needed, e.g., to allow UI update or reduce server load
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        setStatus('error'); // Set global status to error if any frame fails
        break; // Stop the sequence on the first error
      }
    }

    // After the loop finishes or breaks
    console.log(`Capture sequence finished. Successful captures: ${successfulCaptures}`);
    setIsCapturingSequence(false); // Mark sequence as finished
    // Set final status based on whether all 5 succeeded
    if (status !== 'error') { // Avoid overwriting error status if loop broke
        setStatus(successfulCaptures === 5 ? 'success' : 'error');
        if (successfulCaptures < 5 && !error) {
            // Set a generic error if loop finished early but no specific error was caught
             setError('Capture sequence incomplete.');
        }
    }
    // Keep captureCount at 5 if successful, otherwise it reflects the last attempted frame
    if (status === 'success') setCaptureCount(5);
  };

  // Toggle Camera Function (simplified)
  const toggleCamera = () => (isCameraOn ? stopCamera() : startCamera());

  // Effect for cleanup on unmount (unchanged)
  useEffect(() => {
    // Cleanup function to stop camera when component unmounts
    return () => stopCamera();
  }, []); // Empty dependency array ensures this runs only on mount and unmount


  // --- UI Helper for Status Indicator Color ---
  const getStatusColor = () => {
    // Show yellow while actively capturing
    if (isCapturingSequence) return 'bg-yellow-500';

    // Show final status colors otherwise
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500'; // idle
    }
  };

  // --- UI Helper for Status Indicator Text ---
   const getStatusText = () => {
    if (isCapturingSequence) return `Capturing ${captureCount}/5...`;
    switch (status) {
        case 'success': return '5 Photos Captured!';
        case 'error': return 'Capture Error';
        case 'idle': return 'Ready';
        default: return 'Status Unknown';
    }
   };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-bold mb-6 text-center">Attendance Camera</h2>

          {/* --- Video Feed Area --- */}
          <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-100">
            {/* Loading Spinner */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}

            {/* Error Display */}
            {error && !loading && ( // Only show error if not loading
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 z-10">
                <p className="text-red-600 text-center p-4">{error}</p>
              </div>
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted // Good practice for autoplay
              className={`w-full h-full object-cover transition-opacity duration-300 ${!isCameraOn || loading ? 'opacity-0' : 'opacity-100'}`}
              aria-label="Live camera feed"
              // Add listener to check when video is ready to play to avoid dimension issues
              onLoadedData={() => console.log("Video data loaded.")}
              onCanPlay={() => console.log("Video can play.")}
            />

            {/* Placeholder when camera is off */}
             {!isCameraOn && !loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <p className="text-gray-500">Camera is off</p>
                </div>
             )}

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Status Indicator */}
            <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white text-sm font-medium ${getStatusColor()} transition-colors duration-300 z-10`}>
              {getStatusText()}
            </div>
          </div>

          {/* --- Control Buttons --- */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Start/Stop Camera Button */}
            <button
              onClick={toggleCamera}
              disabled={loading || isCapturingSequence} // Disable while loading or capturing sequence
              className={`px-8 py-4 rounded-lg shadow-lg transition-all duration-300 text-lg font-semibold w-full sm:w-auto ${
                loading || isCapturingSequence
                    ? 'bg-gray-400 cursor-not-allowed'
                : isCameraOn
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              aria-label={isCameraOn ? "Stop Camera" : "Start Camera"}
            >
              {loading ? 'Starting...' : (isCameraOn ? 'Stop Camera' : 'Start Camera')}
            </button>

            {/* Capture 5 Photos Button */}
            <button
              onClick={startCaptureSequence}
              disabled={!isCameraOn || isCapturingSequence || loading} // Disable if camera off, sequence running, or loading
              className={`px-8 py-4 rounded-lg shadow-lg transition-all duration-300 text-lg font-semibold w-full sm:w-auto ${
                (!isCameraOn || isCapturingSequence || loading)
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              aria-label="Capture 5 photos"
            >
              {isCapturingSequence ? `Capturing ${captureCount}/5...` : 'Capture 5 Photos'}
            </button>
          </div>

          {/* --- Instructional Text --- */}
          <div className="mt-6 text-center text-gray-600">
            <p className="text-sm">
              {isCameraOn
                ? 'Camera is active. Click "Capture 5 Photos" to start the process.'
                : 'Click "Start Camera" first, then you can capture photos.'}
            </p>
            {isCapturingSequence && <p className="text-sm mt-2 text-yellow-700">Please wait while photos are being captured and sent...</p>}
            {status === 'success' && <p className="text-sm mt-2 text-green-700">Photo capture sequence completed successfully.</p>}
            {status === 'error' && <p className="text-sm mt-2 text-red-700">An error occurred during the capture sequence. Check console for details.</p>}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;