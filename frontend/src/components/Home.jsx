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
  </div>
);

export default Home;
  