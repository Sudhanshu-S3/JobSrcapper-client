const dev = {
    API_URL: "http://localhost:5000/api"
};

const prod = {
    API_URL: "https://your-backend-api-url.com/api" // Replace with your actual deployed backend URL
};

const config = process.env.NODE_ENV === "production" ? prod : dev;

export default config;