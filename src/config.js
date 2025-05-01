const dev = {
    API_URL: "http://localhost:5050/api"
};

const prod = {
    API_URL: "https://jobsrcapper-server.onrender.com/api"
};

// Force production config when on GitHub Pages domain
const isGitHubPages = window.location.hostname.includes('github.io');
const config = (process.env.NODE_ENV === "production" || isGitHubPages) ? prod : dev;

export default config;