# Health Camp Impact Analysis Platform 🏥

<div align="center">
  <img src="frontend/public/logo.png" alt="Health Camp Impact Logo" width="200"/>
  
  [![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)](https://fastapi.tiangolo.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-38B2AC)](https://tailwindcss.com/)
</div>

## 📋 Overview

Health Camp Impact Analysis Platform is a comprehensive solution for analyzing and visualizing health camp data across different regions. The platform provides insights into disease outbreaks, environmental factors, and their impact on public health.

### 🌟 Key Features

- Interactive disease outbreak mapping
- Real-time data visualization
- Environmental factor analysis (Temperature, Precipitation, LAI)
- Comprehensive data analytics dashboard
- Multi-region support
- Responsive and modern UI

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Apache Druid (v25.0.0)
- Git

### 🛠️ Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/HealthCampImpact.git
cd HealthCampImpact
```

#### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

#### 4. Apache Druid Setup

1. Download Apache Druid from the [official website](https://druid.apache.org/downloads.html)
2. Extract the downloaded file
3. Navigate to the Druid directory
4. Start Druid using the quickstart configuration:

```bash
./bin/start-quickstart
```

## 📊 Data Structure

The platform processes the following key data points:
- Disease outbreaks
- Cases and deaths
- Geographic coordinates
- Environmental factors (Temperature, Precipitation, LAI)
- Temporal data

## 🏗️ Project Structure

```
HealthCampImpact/
├── frontend/           # React + TypeScript frontend
│   ├── src/           # Source files
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # FastAPI backend
│   ├── main.py       # Main application file
│   └── requirements.txt # Backend dependencies
└── README.md         # Project documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=your_druid_connection_string
API_KEY=your_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Apache Druid for data processing
- FastAPI for backend framework
- React and TypeScript for frontend development
- All contributors who have helped shape this project 