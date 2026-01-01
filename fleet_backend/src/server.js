require('dotenv').config(); // safe for local only

const http = require('http');
const cors = require('cors');
const app = require('./app');
const { init } = require('./sockets');

const PORT = process.env.PORT || 4000;

// ✅ Add CORS middleware to allow your Vercel/Render frontend
const allowedOrigins = [
  "http://localhost:5173",              // local dev
  process.env.ALLOWED_ORIGINS           // deployed frontend (e.g. https://fleet-frontend.onrender.com)
].filter(Boolean); // remove undefined if env var not set

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET is not defined!");
}

console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

const server = http.createServer(app);

// ✅ Initialize Socket.IO with CORS for frontend
init(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
