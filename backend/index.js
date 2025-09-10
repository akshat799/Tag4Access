// backend/index.js
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for React Native

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tag4access";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schemas for Tag4Access app
const TagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#007AFF' },
  createdAt: { type: Date, default: Date.now }
});

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  location: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AccessibilityTagSchema = new mongoose.Schema({
  locationName: { type: String, required: true },
  featureType: { 
    type: String, 
    required: true,
    enum: ['Entrance', 'Ramp', 'Elevator', 'Washroom', 'Parking', 'Pathway', 'Stairs', 'Sidewalk', 'Crosswalk', 'Building Access', 'Seating Area', 'Information Desk', 'ATM/Kiosk', 'Emergency Exit', 'Lighting', 'Signage']
  },
  accessibilityStatus: { 
    type: String, 
    required: true,
    enum: ['Fully Accessible', 'Partially Accessible', 'Not Accessible', 'Temporarily Inaccessible', 'Under Construction', 'Needs Repair', 'Unknown Status']
  },
  priorityLevel: { 
    type: String, 
    required: true,
    enum: ['Low Priority', 'Medium Priority', 'High Priority', 'Critical', 'Emergency']
  },
  description: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  photoUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Tag = mongoose.model("Tag", TagSchema);
const Item = mongoose.model("Item", ItemSchema);
const AccessibilityTag = mongoose.model("AccessibilityTag", AccessibilityTagSchema);

// API Routes

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Tag4Access API is running!" });
});

// Tag routes
app.get("/api/tags", async (req, res) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/tags", async (req, res) => {
  try {
    const tag = new Tag(req.body);
    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Item routes
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find().populate('tags').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    const populatedItem = await Item.findById(item._id).populate('tags');
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/items/search", async (req, res) => {
  try {
    const { query } = req.query;
    const items = await Item.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    }).populate('tags');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accessibility Tag routes
app.get("/api/accessibility-tags", async (req, res) => {
  try {
    const accessibilityTags = await AccessibilityTag.find().sort({ createdAt: -1 });
    res.json(accessibilityTags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to view all accessibility tags with count
app.get("/api/accessibility-tags/debug", async (req, res) => {
  try {
    const accessibilityTags = await AccessibilityTag.find().sort({ createdAt: -1 });
    const count = await AccessibilityTag.countDocuments();
    res.json({
      count: count,
      data: accessibilityTags,
      message: `Found ${count} accessibility tags in database`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/accessibility-tags", async (req, res) => {
  try {
    const accessibilityTag = new AccessibilityTag(req.body);
    await accessibilityTag.save();
    res.status(201).json(accessibilityTag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));