# Sleeper Fantasy Dashboard

A comprehensive dashboard for Sleeper Fantasy Football leagues with advanced player analytics, AI-powered insights, and real-time statistics.

## Features

- 📊 Real-time player statistics and analytics
- 🤖 AI-powered player insights and predictions
- 📈 Advanced data visualization
- 🏃‍♂️ Live player performance tracking
- 🔄 Automatic data synchronization
- 🌓 Dark mode support

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Python 3.10 or higher (for API)
- npm 10.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sleeper-fantasy-dashboard.git
cd sleeper-fantasy-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

### API Setup

1. Install Python dependencies:
```bash
pip install -r api/requirements.txt
```

2. Start the API server:
```bash
npm run api
```

### NFL Data (Optional)

For NFL data fetching functionality:

1. Install required Python packages:
```bash
pip install pandas numpy matplotlib seaborn scikit-learn
```

2. Run the NFL data fetch script:
```bash
npm run fetch:nfl
```

## Testing

Run unit tests:
```bash
npm test
```

Run E2E tests:
```bash
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.