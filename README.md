# 🔍 ThreatLens
### Intelligent Cybersecurity Threat Detection & Monitoring Platform

**ThreatLens** is a cybersecurity platform designed to help users identify, analyze, and monitor potential security threats through a centralized web interface.

It combines a modern web dashboard, backend services, and browser extension integration to provide security analysis, monitoring, and reporting capabilities.

The goal of ThreatLens is to make cybersecurity monitoring more accessible through an intuitive and organized platform.

---

## 🌐 Live Demo

**Live Application:** https://threatlens.ai.studio

Visit the deployed application to explore ThreatLens without installing the project or configuring a local database.

---

## 🚀 Key Features

- **Threat Scanning:** Analyze potential security threats through the platform.
- **Security Dashboard:** Centralized interface for security-related information.
- **User Authentication:** Authentication and account management.
- **Browser Extension:** Browser extension integration.
- **Reports Management:** Generate and manage security reports.
- **Admin Dashboard:** Administrative management functionality.
- **Real-Time Communication:** Socket.IO integration.
- **Image and Text Processing:** OCR-based text extraction capabilities.
- **Data Visualization:** Visual representation of security-related information.

---

## 🛠️ Technology Stack

### Frontend
- React.js
- JavaScript
- Tailwind CSS
- Recharts
- D3.js
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JSON Web Token (JWT)
- Helmet.js

### Additional Libraries
- Tesseract.js
- Sharp
- HLS.js
- Bcrypt.js

---

## 📁 Project Structure

```text
ThreatLens/
│
├── client/                 # React frontend
│
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── controllers/        # Request controllers
│   ├── middleware/         # Backend middleware
│   ├── uploads/            # Uploaded files
│   └── server.js           # Backend entry point
│
├── extension/              # Browser extension
│
├── src/
│   └── assets/
│       └── images/         # Project assets
│
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Local Installation & Setup

Want to run ThreatLens on your own computer? Follow these steps.

### 1. Clone the Repository

```bash
git clone https://github.com/Rakshhh-bit/Threat-lens.git
```

### 2. Navigate to the Project

```bash
cd Threat-lens
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

Add your own database connection and authentication credentials:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Use your own MongoDB connection string and a secure JWT secret.

**Important:** Never upload your `.env` file or expose sensitive credentials on GitHub.

### 5. Start the Application

```bash
npm run dev
```

### 6. Open Locally

```text
http://localhost:3000
```

*Note: Make sure all required frontend and backend dependencies and environment variables are configured before running the application.*

---

## 🔌 Backend API Routes

| Endpoint | Description |
|---|---|
| `/api/auth` | Authentication |
| `/api/scan` | Threat scanning |
| `/api/admin` | Administration |
| `/api/extension` | Browser extension integration |
| `/api/reports` | Reports management |
| `/api/contact` | Contact functionality |
| `/health` | Server health check |

---

## 🔐 Security Considerations

ThreatLens incorporates security-related backend components, including:

- Helmet.js for HTTP security headers.
- JWT-based authentication support.
- Password hashing support.
- CORS configuration.
- Request payload size limits.
- Backend error handling.
- Environment-based configuration for sensitive credentials.

---

## 🎯 Project Objectives

1. Develop a centralized cybersecurity monitoring platform.
2. Provide tools for identifying and analyzing potential threats.
3. Integrate browser extension functionality.
4. Present security information through an interactive dashboard.
5. Support organized security reporting and administration.
6. Explore practical applications of modern web technologies in cybersecurity.

---

## 🔮 Future Enhancements

- Advanced threat intelligence integration.
- Improved automated threat detection.
- Enhanced security analytics and visualization.
- Expanded browser protection capabilities.
- More detailed security reports.
- Additional monitoring and alerting capabilities.

---

## 👨‍💻 Developer

**Rakshit Rawal**

GitHub: https://github.com/Rakshhh-bit

Project Repository: https://github.com/Rakshhh-bit/Threat-lens

Live Project: https://threatlens.ai.studio

---

## 📜 License

This project is currently maintained as a development project. Licensing terms can be added when a license is selected.

---

⭐ If you find this project interesting, consider giving the repository a star!

**ThreatLens — Building a Smarter Approach to Cybersecurity.**
