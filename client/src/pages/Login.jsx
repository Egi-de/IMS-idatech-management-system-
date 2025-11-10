import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { login } from "../services/api";
import Button from "../components/Button";
import Input from "../components/Input";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(formData.username, formData.password);
      const token = response.data.token;

      // ✅ Store token
      localStorage.setItem("authToken", token);
      console.log("Login successful, token:", token);

      toast.success("Login successful! Redirecting to dashboard...");

      // Log login activity
      try {
        await fetch("/api/settings/activities/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            activity_type: "login",
            description: `User ${formData.username} logged in`,
            item_type: "user",
            item_id: formData.username,
          }),
        });
      } catch (error) {
        console.error("Failed to log login activity:", error);
      }

      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      setError(message);
      toast.error(message);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center filter"
          style={{
            backgroundImage: "url(/idatechprofile.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gray-10 bg-opacity-10"></div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-800">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/idalogo.png"
              alt="IDA Tech Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              icon={UserIcon}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              icon={LockClosedIcon}
              required
            />

            <Button type="submit" className="w-full" loading={loading}>
              <LockClosedIcon className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
