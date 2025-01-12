const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb+srv://leony:Aa12345678@gisproject.z3nww.mongodb.net/dorm_finder?retryWrites=true&w=majority';

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.send('Welcome to the Dorm Finder API!');
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, role: user.role }, 'secretKey');
      res.json({ token, role: user.role });
  } else {
      res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'secretKey');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ name: user.name, email: user.email });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'secretKey');
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

app.put('/api/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'secretKey');
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// עדכון פרטי משתמש
app.put('/api/update-profile', async (req, res) => {
  try {
    // הדפסת הכותרות והגוף של הבקשה
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    // בדוק את ה-token
    console.log('Token:', token);

    const decoded = jwt.verify(token, 'secretKey');
    console.log('Decoded Token:', decoded);

    const { name, email } = req.body;

    // בדיקה אם השדות קיימים
    if (!name || !email) {
      console.log('Name or email missing:', { name, email });
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // עדכן את המשתמש
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { name, email },
      { new: true } // מחזיר את הנתונים המעודכנים
    );

    if (!updatedUser) {
      console.log('User not found for ID:', decoded.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // הדפס את המשתמש המעודכן
    console.log('Updated User:', updatedUser);

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

const Dorm = require('./models/Dorm'); // נתיב למודל שיצרת

// הוספת מעון חדש
// הוספת מעון חדש
app.post('/api/dorms', async (req, res) => {
  try {
    console.log('Request body:', req.body); // לוג נתוני הבקשה
    const { name, phone, address, coordinates } = req.body;

    if (!name || !phone || !address || !coordinates) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const dorm = new Dorm({
      name,
      phone,
      address,
      coordinates,
    });

    const savedDorm = await dorm.save();
    console.log('Dorm saved:', savedDorm); // לוג של המעון שנשמר
    res.status(201).json(savedDorm);
  } catch (error) {
    console.error('Error saving dorm:', error.message); // לוג שגיאה
    res.status(500).json({ message: 'Error saving dorm' });
  }
});


// שליפת כל המעונות
app.get('/api/dorms', async (req, res) => {
  try {
    const dorms = await Dorm.find();
    res.json(dorms);
  } catch (error) {
    console.error('Error fetching dorms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// עדכון מעון
app.put('/api/dorms/:id', async (req, res) => {
  try {
    const { name, phone, address, coordinates } = req.body;
    await Dorm.findByIdAndUpdate(req.params.id, { name, phone, address, coordinates });
    res.json({ message: 'Dorm updated successfully' });
  } catch (error) {
    console.error('Error updating dorm:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
