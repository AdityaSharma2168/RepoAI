# RepoAI

RepoAI is an open-source Python library and platform that provides a collection of modular, ready-to-use AI tools designed to streamline the development of AI-powered applications.

## Features

- **Modular AI Tools**: Pre-built tools for text summarization, sentiment analysis, speech-to-text conversion, and more
- **Plugin System**: Extend functionality by uploading your own AI tools as plugins
- **RESTful API**: Access all tools through a unified API interface
- **User Authentication**: Secure JWT-based authentication
- **Modern Frontend**: React-based dashboard for tool exploration and management

## Project Structure

```
RepoAI/
├── backend/                     # FastAPI backend
│   ├── app/                     # Application code
│   │   ├── main.py              # Entry point
│   │   ├── config.py            # Configuration
│   │   ├── auth/                # Authentication
│   │   ├── users/               # User management
│   │   ├── tools/               # AI tools
│   │   ├── plugins/             # Plugin system
│   │   └── database/            # Database models and connection
│   ├── tests/                   # Backend tests
│   └── requirements.txt         # Python dependencies
├── frontend/                    # React frontend
│   ├── public/                  # Static files
│   ├── src/                     # React code
│   ├── package.json             # Node dependencies
│   └── README.md                # Frontend docs
├── docs/                        # Documentation
├── docker-compose.yml           # Docker Compose configuration
└── README.md                    # Project overview
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local frontend development)
- Python 3.10+ (for local backend development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AdityaSharma2168/RepoAI.git
   cd RepoAI
   ```

2. Start the development environment:
   ```bash
   docker-compose up
   ```

3. Access the services:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## Core AI Tools

RepoAI includes the following built-in AI tools:

- **Text Summarizer**: Summarize long texts into concise summaries
- **Sentiment Analyzer**: Analyze text sentiment as positive, negative, or neutral

Additional tools will be added in future releases.

## Plugin System

You can extend RepoAI by creating your own plugins:

1. Create a Python file with a `Plugin` class that implements your AI functionality
2. Upload the plugin through the web interface or API
3. Once approved by an admin, your plugin becomes available to all users

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

- AdityaSharma2168 