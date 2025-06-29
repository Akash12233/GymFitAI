# FitAI - AI-Powered Fitness Application

A comprehensive fitness application powered by artificial intelligence that provides personalized workout plans, progress tracking, and intelligent coaching recommendations.

## 🌟 Features

- **AI-Powered Workout Planning**: Generate personalized workout plans based on user profile and goals
- **Real-time Progress Tracking**: Track workouts, sets, reps, and overall fitness progress
- **Smart Calendar**: Visual progress calendar with workout completion status
- **AI Coach Chat**: Interactive AI assistant for fitness guidance and questions
- **Premium Analytics**: Advanced workout analytics and insights (Premium feature)
- **Google OAuth Integration**: Seamless authentication with Google accounts
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Subscription Management**: Free and Premium tier functionality

## 🏗️ Architecture

This application follows a modern full-stack architecture:

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT + Google OAuth
- **AI Integration**: OpenAI API for workout generation and chat
- **Deployment**: Netlify (Frontend) + Railway/Render (Backend)

## 📁 Project Structure

```
fitnai/
├── frontend/          # React TypeScript application
├── backend/           # Node.js Express API
├── archive/           # Data import utilities
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- OpenAI API key
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitnai
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.sample .env
   # Configure your environment variables
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 🔧 Environment Configuration

### Backend (.env)
```env
PORT=8000
MONGO_URI=mongodb://localhost:27017
DB_NAME=fitnation
ACCESS_TOKEN_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
OPENAI_API_KEY_1=your-openai-api-key
MODEL_NAME=gpt-4
GOOGLE_CLIENT_ID=your-google-client-id
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_NODE_ENV=development
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Component Architecture](./docs/COMPONENT_ARCHITECTURE.md)
- [Integration Testing](./docs/INTEGRATION_TESTING.md)

## 🔐 Authentication

The application supports multiple authentication methods:

- **Email/Password**: Traditional registration and login
- **Google OAuth**: One-click authentication with Google accounts
- **JWT Tokens**: Secure session management with access and refresh tokens

## 💳 Subscription Tiers

### Free Tier
- Basic workout tracking
- Limited AI suggestions (5/month)
- Community access
- Basic progress calendar

### Premium Tier
- Unlimited AI coaching
- Advanced analytics
- Custom workout creation
- Nutrition planning
- Priority support
- Export capabilities

## 🚀 Deployment

### Frontend (Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

### Backend (Railway/Render)
```bash
cd backend
# Configure environment variables on your platform
# Deploy using platform-specific instructions
```

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend
```bash
cd backend
npm run test
npm run test:integration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Contact: support@fitai.com
- Documentation: [docs.fitai.com](https://docs.fitai.com)

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- MongoDB for database solutions
- Netlify for frontend hosting
- All contributors and testers

---

Built with ❤️ by the FitAI Team