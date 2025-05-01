const dev = {
    API_URL: "http://localhost:5050/api" // Updated port from 5000 to 5050 to match server config
};

const prod = {
    API_URL: "https://jobsrcapper-server.onrender.com/api" // Fixed: added /api path and removed trailing slash
};

const config = process.env.NODE_ENV === "production" ? prod : dev;

export default config;