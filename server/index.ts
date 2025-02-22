import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import http from 'http';
import { Server as WebSocketServer } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new WebSocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB setup
const mongoUri = process.env.MONGO_URI || '';
const client = new MongoClient(mongoUri);
let db: any;

client.connect().then(() => {
  db = client.db('musicRemixer');
  console.log('Connected to MongoDB');
});

// AWS S3 setup
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = process.env.AWS_S3_BUCKET_NAME || '';

// JWT setup
const jwtSecret = process.env.JWT_SECRET || 'default_secret';

// Helper functions
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};

// Routes

// User Authentication
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.collection('users').findOne({ username });
  if (user) {
    return res.status(400).send('User already exists');
  }

  await db.collection('users').insertOne({ username, password: hashedPassword });
  res.status(201).send('User registered successfully');
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await db.collection('users').findOne({ username });
  if (!user) {
    return res.status(400).send('User not found');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).send('Invalid password');
  }

  const token = jwt.sign({ id: user._id, username: user.username }, jwtSecret, {
    expiresIn: '1h',
  });
  res.json({ token });
});

// Project Management
app.post('/api/projects', authenticateToken, async (req, res) => {
  const { name, tracks, bpm, timeSignature, masterVolume } = req.body;

  const project = {
    name,
    tracks,
    bpm,
    timeSignature,
    masterVolume,
    userId: req.user.id,
    createdAt: new Date(),
  };

  const result = await db.collection('projects').insertOne(project);
  res.status(201).json({ id: result.insertedId });
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  const projects = await db
    .collection('projects')
    .find({ userId: req.user.id })
    .toArray();
  res.json(projects);
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  const project = await db.collection('projects').findOne({
    _id: new ObjectId(id),
    userId: req.user.id,
  });

  if (!project) {
    return res.status(404).send('Project not found');
  }

  res.json(project);
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, tracks, bpm, timeSignature, masterVolume } = req.body;

  const result = await db.collection('projects').updateOne(
    { _id: new ObjectId(id), userId: req.user.id },
    {
      $set: {
        name,
        tracks,
        bpm,
        timeSignature,
        masterVolume,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).send('Project not found');
  }

  res.send('Project updated successfully');
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  const result = await db.collection('projects').deleteOne({
    _id: new ObjectId(id),
    userId: req.user.id,
  });

  if (result.deletedCount === 0) {
    return res.status(404).send('Project not found');
  }

  res.send('Project deleted successfully');
});

// File Upload Handling
app.post('/api/upload', authenticateToken, async (req, res) => {
  const file = req.body.file; // Assuming file is sent as base64 string
  const fileName = `${req.user.id}-${Date.now()}.wav`;
  const fileBuffer = Buffer.from(file, 'base64');

  const uploadParams = {
    Bucket: bucketName,
    Key: `uploads/${fileName}`,
    Body: fileBuffer,
    ContentType: 'audio/wav',
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    res.json({ fileName });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Failed to upload file');
  }
});

// WebSocket Setup for Real-Time Collaboration
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on('updateTrack', (projectId, trackData) => {
    socket.to(projectId).emit('trackUpdated', trackData);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
