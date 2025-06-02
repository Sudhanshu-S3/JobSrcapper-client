# LinkedIn Job Search Aggregator

A React-based job search aggregator that pulls listings from LinkedIn and presents them in a clean interface.

## Features

- Search for jobs on LinkedIn
- Filter results by job type, location, and more
- Clean, responsive user interface
- Real-time job data from LinkedIn

## Tech Stack

- React.js
- Axios for API calls
- GitHub Pages for deployment

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Sudhanshu-S3/JobSrcapper-client.git
   cd JobSrcapper-client
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

### Backend Connection

This frontend connects to the LinkedIn job scraper backend API. By default, it's configured to use `http://localhost:5050` in development (via proxy in `package.json` and direct URL in `src/config.js`).

## Deployment

The project is configured for deployment on GitHub Pages:

```bash
npm run deploy
```

This will build the project and deploy it to the `gh-pages` branch of your repository.

## API Configuration

For production deployment, you'll need to create a `src/config.js` file to specify your API endpoints:

```javascript
const dev = {
  API_URL: "http://localhost:5050/api", // Ensure this matches your local server
};

const prod = {
  API_URL: "https://your-backend-api-url.com/api",
};

const config = process.env.NODE_ENV === "production" ? prod : dev;

export default config;
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
