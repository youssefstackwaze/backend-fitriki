import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import tripRoutes from './routes/trip.routes';
import bookingRoutes from './routes/booking.routes';
import negotiationRoutes from './routes/negotiation.routes';
import reviewRoutes from './routes/review.routes';
import complaintRoutes from './routes/complaint.routes';
import adminRoutes from './routes/admin.routes';
import pushTokenRoutes from './routes/push-token.routes';

// Middlewares
import { errorHandler, notFound } from './middlewares/error.middleware';

/**
 * Configuration de l'application Express
 */
const createApp = (): Application => {
  const app = express();

  // ===== MIDDLEWARES DE SÉCURITÉ =====
  
  // Helmet pour sécuriser les headers HTTP
  app.use(helmet());

  // CORS - Configuration pour autoriser le frontend et les apps mobiles
  // Pour les apps mobiles React Native/Expo, on autorise toutes les origines
  // car elles n'ont pas de domaine fixe comme les apps web
  const corsOptions = {
    origin: process.env.FRONTEND_URL === '*' || !process.env.FRONTEND_URL
      ? true // Autoriser toutes les origines pour les apps mobiles
      : process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // Rate limiting pour prévenir les abus
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes par défaut
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requêtes par fenêtre
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // ===== MIDDLEWARES DE BASE =====
  
  // Parser JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging des requêtes en développement
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // ===== ROUTE RACINE =====
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: '🚗 API Covoiturage - Bienvenue !',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: '/health',
        api: '/api',
        documentation: '/api/docs',
      },
    });
  });

  // ===== ROUTE DE SANTÉ =====
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API Covoiturage - Serveur opérationnel',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // ===== ROUTES API =====
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/negotiations', negotiationRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/push-tokens', pushTokenRoutes);

  // ===== GESTION DES ERREURS =====
  
  // Route non trouvée
  app.use(notFound);

  // Gestionnaire d'erreurs global
  app.use(errorHandler);

  return app;
};

export default createApp;

