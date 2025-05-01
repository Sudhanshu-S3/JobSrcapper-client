const dev = {
    API_URL: "http://localhost:5050/api" // Updated port from 5000 to 5050 to match server config
};

const prod = {
    API_URL: "https://job-aggregator-backend.onrender.com/api" // Updated to standard Render URL pattern
};

const config = process.env.NODE_ENV === "production" ? prod : dev;

export default config;