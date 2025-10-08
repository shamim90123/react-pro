import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app you'd validate credentials here
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Please login to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
  
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl 
                        focus:outline-none focus:ring-1 focus:ring-[#282560] 
                        focus:border-[#282560] bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl 
             focus:outline-none focus:ring-1 focus:ring-[#282560] 
             focus:border-[#282560] bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 border-gray-300 rounded focus:ring-blue-500"
              />
              Remember me
            </label>

            <a href="#" className="text-sm hover:underline">
              Forgot password?
            </a>
          </div>

         <button
            type="submit"
            className="w-full py-2.5 bg-[#282560] hover:bg-[#1f1c4d] text-white rounded-xl text-sm font-medium shadow-sm transition"
          >
            Sign in
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <a href="#" className="hover:underline font-medium">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}
