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
    enum: [
      // New simplified statuses
      'Accessible', 'Inaccessible', 'Pending', 'Unconfirmed',
      // Legacy statuses for backward compatibility
      'Fully Accessible', 'Partially Accessible', 'Not Accessible', 
      'Temporarily Inaccessible', 'Under Construction', 'Needs Repair', 'Unknown Status'
    ]
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

// Get only the most recent accessibility tag for each unique location
app.get("/api/accessibility-tags/latest-per-location", async (req, res) => {
  try {
    // Use MongoDB aggregation to group by location and get the most recent tag for each
    const latestTags = await AccessibilityTag.aggregate([
      {
        // Sort by creation date (newest first)
        $sort: { createdAt: -1 }
      },
      {
        // Group by location coordinates (rounded to avoid floating point precision issues)
        $group: {
          _id: {
            lat: { $round: [{ $multiply: ["$latitude", 10000] }, 0] }, // Round to 4 decimal places
            lng: { $round: [{ $multiply: ["$longitude", 10000] }, 0] }
          },
          // Take the first (most recent) document for each location
          latestTag: { $first: "$$ROOT" }
        }
      },
      {
        // Replace the root with the latest tag document
        $replaceRoot: { newRoot: "$latestTag" }
      },
      {
        // Sort the final results by creation date
        $sort: { createdAt: -1 }
      }
    ]);
    
    console.log(`Returning ${latestTags.length} latest tags (one per location)`);
    res.json(latestTags);
  } catch (error) {
    console.error('Error fetching latest tags per location:', error);
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
    console.log('Creating new accessibility tag:', req.body);
    const accessibilityTag = new AccessibilityTag(req.body);
    await accessibilityTag.save();
    console.log('Successfully saved accessibility tag:', accessibilityTag._id);
    res.status(201).json(accessibilityTag);
  } catch (error) {
    console.error('Error creating accessibility tag:', error);
    res.status(400).json({ error: error.message });
  }
});

// New endpoint to get tags by location (for debugging multiple tags per address)
app.get("/api/accessibility-tags/by-location", async (req, res) => {
  try {
    const { latitude, longitude, radius = 0.001 } = req.query; // radius in degrees (~100m)
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);
    
    // Find tags within the specified radius
    const tags = await AccessibilityTag.find({
      latitude: { $gte: lat - rad, $lte: lat + rad },
      longitude: { $gte: lng - rad, $lte: lng + rad }
    }).sort({ createdAt: -1 });
    
    res.json({
      location: { latitude: lat, longitude: lng },
      radius: rad,
      count: tags.length,
      tags: tags
    });
  } catch (error) {
    console.error('Error fetching tags by location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve accessibility tag (change status to Accessible)
app.put("/api/accessibility-tags/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedTag = await AccessibilityTag.findByIdAndUpdate(
      id,
      { accessibilityStatus: 'Accessible' },
      { new: true }
    );
    
    if (!updatedTag) {
      return res.status(404).json({ error: 'Accessibility tag not found' });
    }
    
    console.log('Approved accessibility tag:', updatedTag._id);
    res.json(updatedTag);
  } catch (error) {
    console.error('Error approving accessibility tag:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject accessibility tag (delete it)
app.delete("/api/accessibility-tags/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedTag = await AccessibilityTag.findByIdAndDelete(id);
    
    if (!deletedTag) {
      return res.status(404).json({ error: 'Accessibility tag not found' });
    }
    
    console.log('Rejected and deleted accessibility tag:', deletedTag._id);
    res.json({ message: 'Tag rejected and deleted successfully', deletedTag });
  } catch (error) {
    console.error('Error rejecting accessibility tag:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for admin dashboard
app.get("/api/admin/stats", async (req, res) => {
  try {
    const totalTags = await AccessibilityTag.countDocuments();
    
    // Handle both old and new status values
    const accessibleTags = await AccessibilityTag.countDocuments({ 
      accessibilityStatus: { $in: ['Accessible', 'Fully Accessible'] }
    });
    const pendingTags = await AccessibilityTag.countDocuments({ 
      accessibilityStatus: { $in: ['Pending', 'Partially Accessible'] }
    });
    const unconfirmedTags = await AccessibilityTag.countDocuments({ 
      accessibilityStatus: { $in: ['Unconfirmed', 'Unknown Status'] }
    });
    const inaccessibleTags = await AccessibilityTag.countDocuments({ 
      accessibilityStatus: { 
        $in: ['Inaccessible', 'Not Accessible', 'Temporarily Inaccessible', 'Under Construction', 'Needs Repair'] 
      }
    });
    
    res.json({
      totalTags,
      accessibleTags,
      pendingTags,
      unconfirmedTags,
      inaccessibleTags,
      resolvedIssues: accessibleTags,
      pendingReview: pendingTags + unconfirmedTags
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));