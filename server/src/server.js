

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import { connectDB } from './config/db.js';
import profileRoutes from './routes/profileRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;
const sameSite = process.env.SESSION_COOKIE_SAME_SITE || 'lax';

if (!mongoUri) {
  throw new Error('MONGODB_URI is required.');
}

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be set to a strong secret.');
}

if (!['lax', 'strict', 'none'].includes(sameSite)) {
  throw new Error('SESSION_COOKIE_SAME_SITE must be lax, strict, or none.');
}

if (sameSite === 'none' && !isProduction) {
  throw new Error('SameSite=none requires HTTPS in production.');
}

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));

app.use(
  session({
    name: 'findit.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24 * 7,
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    },
  }),
);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Findit API is running.',
  });
});

//Authroutes
app.use('/api/auth', authRoutes);
//Itemroutes
app.use('/api/items', itemRoutes);

//profileroutes
app.use('/api/profiles', profileRoutes);

//claimroutes
app.use('/api/claims', claimRoutes);

//notificationroutes
app.use('/api/notifications', notificationRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred.'
        : err.message || 'Internal server error.',
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Findit API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Findit API:', error);
    process.exit(1);
  }
};

startServer();








// import 'dotenv/config'
// import express from 'express'
// import cors from 'cors'
// import mongoose from 'mongoose'
// import { connectDB } from './config/db.js'
// import itemRoutes from './routes/itemRoutes.js'

// const app = express()

// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
// }))

// app.use(express.json({ limit: '1mb' }))

// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'FindIt API is running',
//     database: mongoose.connection.readyState === 1
//       ? 'connected'
//       : 'disconnected',
//   })
// })

// app.use('/api/items', itemRoutes)

// app.use((err, req, res, next) => {
//   console.error(err)

//   res.status(500).json({
//     success: false,
//     message: 'An unexpected server error occurred.',
//   })
// })

// const PORT = process.env.PORT || 5000

// async function startServer() {
//   try {
//     await connectDB()

//     app.listen(PORT, () => {
//       console.log(`FindIt API running at http://localhost:${PORT}`)
//     })
//   } catch (error) {
//     console.error('Failed to start server:', error.message)
//     process.exit(1)
//   }
// }

// startServer()
