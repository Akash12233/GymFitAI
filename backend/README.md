# FitAI Backend

A robust Node.js Express API providing AI-powered fitness coaching, workout management, and user authentication services.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Google OAuth
- **AI Integration**: OpenAI API
- **File Upload**: Cloudinary
- **Validation**: Custom middleware
- **Security**: bcrypt, CORS, helmet
- **Scheduling**: node-cron
- **Push Notifications**: Firebase Admin

## 📁 Project Structure

```
src/
├── controllers/        # Request handlers
│   ├── user.controller.js
│   ├── exercises.controller.js
│   ├── recommendation.controller.js
│   └── ...
├── models/            # MongoDB schemas
│   ├── user.model.js
│   ├── exercise.model.js
│   └── ...
├── routes/            # API route definitions
│   ├── user.routes.js
│   ├── exercise.routes.js
│   └── ...
├── middlewares/       # Custom middleware
│   ├── auth.middleware.js
│   ├── authPremium.middleware.js
│   └── multer.middleware.js
├── utils/             # Utility functions
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── cloudinary.js
├── config/            # Configuration files
│   └── openai.config.js
├── db/                # Database connection
│   └── index.js
├── cronjobs.js        # Scheduled tasks
├── app.js             # Express app setup
└── index.js           # Server entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- OpenAI API key
- Cloudinary account (for file uploads)
- Firebase project (for push notifications)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.sample .env
   ```

3. **Configure environment variables**
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

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

5. **Access the API**
   - Base URL: http://localhost:8000/api/v1

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)
npm start           # Start production server

# Database
npm run seed        # Seed database with sample data
npm run migrate     # Run database migrations
```

## 🗄️ Database Schema

### User Model

```javascript
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  workoutPhotos: [{
    url: { type: String },
    date: { type: String }
  }],
  profile: {
    name: { type: String, default: "" },
    gender: { type: String, enum: ['male','female','other'] },
    age: { type: Number, default: 0 },
    bodytype: { type: String, default: "" },
    weightKg: { type: Number, default: 0 },
    heightCm: { type: Number, default: 0 },
    bodyfat: { type: Number, default: 0 },
    experienceLevel: { type: String, enum: ['beginner','intermediate','advanced'] },
    currentStreak: { type: Number, default: 0 },
    workoutsCompleted: { type: Number, default: 0 },
    totalWorkouts: { type: Number, default: 0 }
  },
  strengthInfo: {
    maxPushups: { type: Number, default: 0 },
    maxPullups: { type: Number, default: 0 },
    maxSquats: { type: Number, default: 0 },
    maxBenchKg: { type: Number, default: 0 },
    maxSquatkg: { type: Number, default: 0 },
    maxDeadliftkg: { type: Number, default: 0 }
  },
  premiumExpiry: { type: Date, default: null },
  tier: { type: String, enum: ['free','premium'], default: 'free' },
  preferences: {
    goal: { type: String, default: "" },
    daysPerWeek: { type: Number, default: 0 },
    planStyle: { type: String, default: "" },
    sessionDuration: { type: Number, default: 0 },
    equipment: { type: String, default: "" },
    limitations: { type: String, default: "" },
    availableTime: { type: String, default: "" }
  },
  refreshToken: { type: String, default: null },
  deviceToken: { type: String, default: null }
});
```

### Exercise Model

```javascript
const ExerciseSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  id: { type: Number },
  name: { type: String, required: true },
  title: { type: String },
  date: { type: Date, required: true },
  description: { type: String },
  shortDescription: { type: String },
  type: { type: String },
  bodyPart: { type: String },
  equipment: { type: String },
  weight: { type: Number },
  duration: { type: Number },
  restperoid: { type: Number },
  instructions: { type: String },
  level: { type: String },
  difficultyTag: { type: String },
  avgSets: { type: Number },
  avgReps: { type: Number },
  calorieBurnPerRep: { type: Number },
  status: {
    completedByUser: { type: Boolean, default: false },
    completePercent: { type: Number, default: 0 },
    totalSets: { type: Number, default: 1 },
    completedSets: { type: Number, default: 0 },
    totalReps: { type: Number, default: 2 },
    completedReps: { type: Number, default: 0 }
  },
  rating: { type: Number, min: 0, max: 5 },
  ratingDesc: { type: String },
  createdAt: { type: Date, default: Date.now }
});
```

## 🔐 Authentication & Authorization

### JWT Implementation

```javascript
// Generate tokens
const generateAccessAndRefereshTokens = async(userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  
  return { accessToken, refreshToken };
};
```

### Middleware Protection

```javascript
// Authentication middleware
export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = req.cookies?.accessToken || 
                req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }
  
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken?._id)
                         .select("-password -refreshToken");
  
  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }
  
  req.user = user;
  next();
});

// Premium feature middleware
export const verifyJWTandPremium = asyncHandler(async (req, _, next) => {
  // First verify JWT
  await verifyJWT(req, _, () => {});
  
  if (req.user.tier === 'free') {
    throw new ApiError(402, "You are not a pro user");
  }
  
  next();
});
```

### Google OAuth Integration

```javascript
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { token } = req.body;
  
  // Verify token with Google
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  const { email, name, picture, sub: googleId } = payload;
  
  // Find or create user
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name, email, avatar: picture, googleId,
      password: 'randomPass', provider: 'google'
    });
  }
  
  const { accessToken, refreshToken } = 
    await generateAccessAndRefereshTokens(user._id);
  
  res.status(200).json({
    success: true,
    data: { user, accessToken, refreshToken }
  });
};
```

## 🤖 AI Integration

### OpenAI Configuration

```javascript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1,
  baseURL: process.env.OPENAI_BASE_URL || "https://models.github.ai/inference"
});

export default openai;
```

### Workout Plan Generation

```javascript
const planRecommendation = asyncHandler(async(req, res) => {
  const { input } = req.body;
  const workoutDate = new Date(input?.date);
  
  const prompt = `You are a professional fitness AI coach. 
    Generate a detailed weekly workout planner based on:
    ${JSON.stringify(input)}
    
    Return valid JSON with this structure:
    {
      "days": [...],
      "nutrition": [...],
      "recommendations": [...],
      "goals": [...],
      "prediction": [...]
    }`;
  
  const chatCompletion = await openai.chat.completions.create({
    model: process.env.MODEL_NAME,
    temperature: 1.0,
    max_tokens: 10000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const plan = chatCompletion.choices[0].message.content;
  const output = JSON.parse(plan.replace("```json", "").replace("```", ""));
  
  // Process and store the generated plan
  // ... implementation details
  
  res.status(200).json(new ApiResponse(true, "Plan created!", output));
});
```

### AI Chat Implementation

```javascript
const chat = asyncHandler(async(req, res) => {
  const { chat } = req.body;
  
  if (!chat) {
    throw new ApiError(400, "Chat message required");
  }
  
  const chatCompletion = await openai.chat.completions.create({
    model: process.env.MODEL_NAME,
    messages: [{ role: 'user', content: chat }]
  });
  
  const reply = chatCompletion.choices[0].message.content;
  
  res.status(200).json(new ApiResponse(true, reply, "Chat replied!"));
});
```

## 📊 API Endpoints

### Authentication Routes

```
POST   /api/v1/user/register          # User registration
POST   /api/v1/user/login             # User login
POST   /api/v1/user/logout            # User logout
POST   /api/v1/user/refresh-token     # Refresh access token
POST   /api/v1/auth/google            # Google OAuth login
```

### User Management

```
GET    /api/v1/user/current-user      # Get current user
PATCH  /api/v1/user/update-account    # Update account details
POST   /api/v1/user/updateprofile     # Update user profile
POST   /api/v1/user/change-password   # Change password
POST   /api/v1/user/workoutphotos     # Upload workout photos
GET    /api/v1/user/getworkoutphotos  # Get workout photos
```

### Exercise Management

```
GET    /api/v1/exercise/getgymexercises     # Get all exercises
GET    /api/v1/exercise/gymexercises/:id    # Get exercise by ID
GET    /api/v1/exercise/search              # Search exercises
POST   /api/v1/exercise/addgymexercises     # Add new exercise
```

### Workout Status

```
POST   /api/v1/statusexercise/exercisesbyday    # Get exercises by day
GET    /api/v1/statusexercise/exercisebyuser    # Get user exercises
POST   /api/v1/statusexercise/exerciseupdated   # Update exercise status
GET    /api/v1/statusexercise/caloriesbyexercises # Get calorie data
```

### AI Recommendations

```
POST   /api/v1/recommendation/planrecommendation  # Generate workout plan
POST   /api/v1/recommendation/chat                # AI chat
GET    /api/v1/recommendation/historyprediction   # History analysis (Premium)
POST   /api/v1/recommendation/updateexercises     # Update exercises (Premium)
```

### Planner Management

```
GET    /api/v1/planner/plannerbyuser    # Get user planners
GET    /api/v1/planner/plannerreport    # Get planner report (Premium)
```

### Transactions

```
GET    /api/v1/transaction/transactionbyuser  # Get user transactions
POST   /api/v1/transaction/savetransaction    # Save transaction
```

## 🔧 Middleware

### Error Handling

```javascript
class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
  }
}

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
           .catch((err) => next(err));
  };
};
```

### File Upload

```javascript
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

export const upload = multer({ storage });
```

### CORS Configuration

```javascript
app.use(cors({
  origin: "*",
  credentials: true
}));
```

## 📅 Scheduled Tasks

### Cron Jobs

```javascript
import cron from "node-cron";

// Daily workout reminders at 10am and 7pm
cron.schedule('0 10,19 * * *', async () => {
  const users = await User.find();
  
  for (const user of users) {
    const exercises = await Exercises.find({
      userId: user._id,
      'date': today
    });
    
    const isIncomplete = exercises.some(ex => 
      ex.status.completedByUser === false
    );
    
    if (isIncomplete) {
      await sendNotification(user._id, 
        'You still have workouts to complete today! 💪'
      );
    }
  }
});

// Premium expiry check at 12pm daily
cron.schedule('0 12 * * *', async () => {
  const expiredUsers = await User.find({
    premiumExpiry: { $lte: new Date() }
  });
  
  for (const user of expiredUsers) {
    user.tier = 'free';
    user.premiumExpiry = null;
    await user.save();
    
    await sendNotification(user._id, 
      'Your premium has expired. Upgrade now! 🚀'
    );
  }
});
```

## 🔔 Push Notifications

### Firebase Integration

```javascript
import admin from 'firebase-admin';

const sendNotification = async (userId, message) => {
  const user = await User.findById(userId);
  if (!user?.deviceToken) return;
  
  const payload = {
    notification: {
      title: "FitNation Reminder 💪",
      body: message,
      sound: "default",
    },
    data: { userId: String(userId) },
    token: user.deviceToken,
  };
  
  const response = await admin.messaging().send(payload);
  console.log('Notification sent:', response);
};
```

## 🗃️ Data Import

### Exercise Data Import

```javascript
// archive/importExercises.js
import mongoose from 'mongoose';
import fs from 'fs';
import csvParser from 'csv-parser';
import GymExercise from './models/gymexercises.js';

const results = [];
fs.createReadStream('megaGymDataset.csv')
  .pipe(csvParser())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    await GymExercise.deleteMany({});
    await GymExercise.insertMany(results);
    console.log('✅ All exercises imported successfully!');
  });
```

## 🧪 Testing

### Unit Tests

```javascript
// Example test
describe('User Controller', () => {
  test('should register new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/api/v1/user/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
  });
});
```

### Integration Tests

```javascript
describe('Workout Flow', () => {
  test('complete workout creation and tracking flow', async () => {
    // 1. Register user
    // 2. Generate workout plan
    // 3. Track exercise completion
    // 4. Verify data persistence
  });
});
```

## 🚀 Deployment

### Environment Variables

```env
# Production environment
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=fitnation_prod
ACCESS_TOKEN_SECRET=your-production-jwt-secret
REFRESH_TOKEN_SECRET=your-production-refresh-secret
OPENAI_API_KEY_1=your-production-openai-key
CLOUDINARY_CLOUD_NAME=your-production-cloudinary
```

### Railway Deployment

```json
// package.json
{
  "scripts": {
    "start": "node -r dotenv/config src/index.js",
    "dev": "nodemon -r dotenv/config src/index.js"
  }
}
```

### Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🔍 Monitoring & Logging

### Request Logging

```javascript
import morgan from 'morgan';

app.use(morgan('combined'));
```

### Error Logging

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

app.use(errorHandler);
```

## 🔒 Security

### Password Hashing

```javascript
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};
```

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📈 Performance

### Database Indexing

```javascript
// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
exerciseSchema.index({ userId: 1, date: 1 });
plannerSchema.index({ userId: 1, createdAt: -1 });
```

### Caching Strategy

```javascript
// Redis caching example
const getExercises = async (userId) => {
  const cacheKey = `exercises:${userId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Fetch from database
  const exercises = await Exercise.find({ userId });
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(exercises));
  
  return exercises;
};
```

## 🤝 Contributing

### Code Style

- Use ES6+ features
- Follow async/await pattern
- Use meaningful variable names
- Add JSDoc comments for functions

### API Design

```javascript
// Good API response structure
const ApiResponse = class {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
};
```

### Error Handling

```javascript
// Consistent error handling
const someController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    throw new ApiError(400, "ID is required");
  }
  
  const data = await SomeModel.findById(id);
  
  if (!data) {
    throw new ApiError(404, "Resource not found");
  }
  
  res.status(200).json(new ApiResponse(200, data, "Success"));
});
```

---

For more information, see the [main README](../README.md) or contact the development team.