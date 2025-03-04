const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
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

// Schemas and Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dorm' }] // הוספת שדה למועדפים
});

const FavoriteSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true }, // שם המשתמש
  dorms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dorm' }] // מזהי מעונות
});

const Favorite = mongoose.model('Favorite', FavoriteSchema);


const dormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

const User = mongoose.model('User', userSchema);
const Dorm = mongoose.model('Dorm', dormSchema);

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Token received:', token); // לוג לראות את הטוקן שהתקבל
  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'secretKey');
    req.user = decoded; // צרף את המידע של המשתמש לבקשה
    console.log('Decoded token:', decoded); // לוג לראות את תוכן הטוקן המפוענח
    next();
  } catch (error) {
    console.error('Invalid or expired token:', error.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};



// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Dorm Finder API!');
});

// User Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

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
    const token = jwt.sign({ id: user._id }, 'secretKey');
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      console.log("✅ User fetched from backend:", user);

      res.json({
          _id: user._id,  // ודא שה- ID נשלח ללקוח
          name: user.name,
          email: user.email,
      });
  } catch (error) {
      console.error('❌ Error fetching profile:', error);
      res.status(500).json({ message: 'Error fetching profile' });
  }
});


app.put('/api/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    if (name.toLowerCase() === 'admin') {
      return res.status(400).json({ message: 'Cannot use "admin" as a username' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/delete-account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dorm Routes
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

app.delete('/api/dorms/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid dorm ID' });
    }

    const deletedDorm = await Dorm.findByIdAndDelete(id);
    if (!deletedDorm) {
      return res.status(404).json({ message: 'Dorm not found' });
    }

    res.json({ message: 'Dorm deleted successfully' });
  } catch (error) {
    console.error('Error deleting dorm:', error.message);
    res.status(500).json({ message: 'Error deleting dorm' });
  }
});

// הוספת מעון למועדפים
app.post('/api/favorites/add', async (req, res) => {
  console.log("Request received:", req.body);

  const { userId, dormId } = req.body;

  if (!userId || !dormId) {
      console.error("❌ Missing userId or dormId:", req.body);
      return res.status(400).json({ error: "Missing userId or dormId" });
  }

  try {
      const user = await User.findById(userId);
      if (!user) {
          console.error("❌ User not found:", userId);
          return res.status(404).json({ error: "User not found" });
      }

      if (!user.favorites.includes(dormId)) {
          user.favorites.push(dormId);
          await user.save();
      }

      console.log("✅ Dorm added to favorites:", user.favorites);
      res.status(200).json({ message: "Dorm added to favorites", favorites: user.favorites });
  } catch (error) {
      console.error("❌ Error adding favorite:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});




app.get('/api/favorites/:userName', async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await User.findOne({ name: userName }).populate('favorites');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("Fetched favorites for user:", user.favorites);
    res.json(user.favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});







app.delete('/api/favorites/remove', async (req, res) => {
  try {
      const { userId, dormId } = req.body;
      if (!userId || !dormId) {
          return res.status(400).json({ message: "Missing userId or dormId" });
      }

      // מציאת המשתמש במסד הנתונים
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      // הסרת ה-ID של המעון מהמועדפים
      user.favorites = user.favorites.filter(id => id.toString() !== dormId);
      await user.save();

      res.status(200).json({ message: "Dorm removed from favorites", favorites: user.favorites });
  } catch (error) {
      console.error("🚨 Error removing from favorites:", error);
      res.status(500).json({ message: "Server error" });
  }
});





// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
