import { Link } from 'react-router-dom';

const Home = () => (
  <div className="min-h-[50vh]">
    {/* Hero Section */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome to AI Attendance System</h1>
        <p className="text-xl mb-8 max-w-xl mx-auto">
          MNNIT's officail attendance marking web app
          Mark your presence with a click of the button
        </p>
        <Link
          to="/camera"
          className="px-8 py-4 bg-white text-blue-600 rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-300 text-lg font-semibold"
        >
          Mark Your Attendance
        </Link>
      </div>
    </div>

    {/* Features Section */}
    {/* <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-blue-600 text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">Accurate Recognition</h3>
          <p className="text-gray-600">Advanced AI algorithms ensure precise facial recognition and attendance tracking.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-blue-600 text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
          <p className="text-gray-600">Process attendance in seconds, saving valuable time for both staff and students.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-blue-600 text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
          <p className="text-gray-600">Built with security in mind, ensuring your attendance data is protected.</p>
        </div>
      </div>
    </div> */}

    {/* CTA Section */}
    
  </div>
);

export default Home;
  