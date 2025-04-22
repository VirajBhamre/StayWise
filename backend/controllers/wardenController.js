const Hostel = require('../models/hostelModel');
const Warden = require('../models/wardenModel');
const Hosteller = require('../models/hostellerModel');
const Complaint = require('../models/complaintModel');
const Maintenance = require('../models/maintenanceModel');
const Event = require('../models/eventModel');
const Payment = require('../models/paymentModel');
const { generateRandomPassword, generateUsername } = require('../utils/generators');

// Get hostel info for warden
const getHostelInfo = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.user.hostel);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add hosteller with auto-generated credentials and auto room assignment
const addHosteller = async (req, res) => {
  try {
    const { name, email, phone, parentPhone, duration } = req.body;
    
    // Check if email already exists
    const existingHosteller = await Hosteller.findOne({ email });
    if (existingHosteller) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Get hostel for room assignment and capacity check
    const hostel = await Hostel.findById(req.user.hostel).populate('floors');
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Check if hostel architecture is defined
    if (!hostel.isRoomArchitectureDefined) {
      return res.status(400).json({ message: 'Room architecture must be defined before adding hostellers' });
    }
    
    // Find available room
    let availableRoom = null;
    let floorIndex = -1;
    let roomIndex = -1;
    
    // Loop through floors and rooms to find an available one
    for (let i = 0; i < hostel.floors.length; i++) {
      for (let j = 0; j < hostel.floors[i].rooms.length; j++) {
        const room = hostel.floors[i].rooms[j];
        if (!room.occupied && room.occupants < room.capacity) {
          availableRoom = room.roomNumber;
          floorIndex = i;
          roomIndex = j;
          break;
        }
      }
      if (availableRoom) break;
    }
    
    if (!availableRoom) {
      return res.status(400).json({ message: 'No available rooms found' });
    }
    
    // Generate username (use email username part with random numbers)
    const username = generateUsername(email);
    
    // Generate random password
    const password = generateRandomPassword();
    
    // Calculate end date based on duration
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(duration));
    
    // Create hosteller with auto-assigned room and generated credentials
    const hosteller = await Hosteller.create({
      name,
      email,
      username,
      password, // Will be hashed by pre-save hook
      phone,
      parentPhone,
      room: availableRoom,
      hostel: req.user.hostel,
      duration: parseInt(duration),
      endDate
    });
    
    // Update room status in hostel
    hostel.floors[floorIndex].rooms[roomIndex].occupants += 1;
    if (hostel.floors[floorIndex].rooms[roomIndex].occupants >= hostel.floors[floorIndex].rooms[roomIndex].capacity) {
      hostel.floors[floorIndex].rooms[roomIndex].occupied = true;
    }
    
    // Update hostel occupied rooms count
    hostel.occupiedRooms += 1;
    await hostel.save();
    
    // Return hosteller data with generated credentials
    res.status(201).json({
      _id: hosteller._id,
      name: hosteller.name,
      email: hosteller.email,
      username: username, // Return the unhashed username
      password: password, // Return the unhashed password
      phone: hosteller.phone,
      parentPhone: hosteller.parentPhone,
      room: hosteller.room,
      duration: hosteller.duration,
      endDate: hosteller.endDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get hosteller details by ID
const getHostellerDetails = async (req, res) => {
  try {
    const { hostellerId } = req.params;
    
    const hosteller = await Hosteller.findById(hostellerId)
      .populate('hostel', 'name hostelId');
    
    if (!hosteller) {
      return res.status(404).json({ message: 'Hosteller not found' });
    }
    
    // Check if hosteller belongs to warden's hostel
    if (hosteller.hostel._id.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this hosteller' });
    }
    
    res.json(hosteller);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Reset hosteller password
const resetHostellerPassword = async (req, res) => {
  try {
    const { hostellerId } = req.params;
    
    // Find hosteller
    const hosteller = await Hosteller.findById(hostellerId);
    
    if (!hosteller) {
      return res.status(404).json({ message: 'Hosteller not found' });
    }
    
    // Check if hosteller belongs to warden's hostel
    if (hosteller.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to reset password for this hosteller' });
    }
    
    // Generate new random password
    const newPassword = generateRandomPassword();
    
    // Update hosteller's password
    hosteller.password = newPassword; // Will be hashed by pre-save hook
    await hosteller.save();
    
    // Return the new plain text password
    res.json({
      message: 'Password reset successfully',
      newPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update hosteller
const updateHosteller = async (req, res) => {
  try {
    const { name, phone, parentPhone, room, duration } = req.body;
    const { hostellerId } = req.params;
    
    // Find hosteller
    const hosteller = await Hosteller.findById(hostellerId);
    
    if (!hosteller) {
      return res.status(404).json({ message: 'Hosteller not found' });
    }
    
    // Check if hosteller belongs to warden's hostel
    if (hosteller.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this hosteller' });
    }
    
    // Get hostel for room validation
    const hostel = await Hostel.findById(req.user.hostel);
    
    // If room is changing, check availability and update room occupancy
    if (room && room !== hosteller.room) {
      // Find the new room
      let newRoomFound = false;
      let newFloorIndex = -1;
      let newRoomIndex = -1;
      
      for (let floorIndex = 0; floorIndex < hostel.floors.length; floorIndex++) {
        const floor = hostel.floors[floorIndex];
        for (let roomIndex = 0; roomIndex < floor.rooms.length; roomIndex++) {
          if (floor.rooms[roomIndex].roomNumber === room) {
            newRoomFound = true;
            newFloorIndex = floorIndex;
            newRoomIndex = roomIndex;
            break;
          }
        }
        if (newRoomFound) break;
      }
      
      if (!newRoomFound) {
        return res.status(400).json({ message: 'New room does not exist' });
      }
      
      // Check if the new room is available
      if (hostel.floors[newFloorIndex].rooms[newRoomIndex].occupied) {
        return res.status(400).json({ message: 'New room is fully occupied' });
      }
      
      // Find the old room and decrease its occupancy
      let oldRoomFound = false;
      let oldFloorIndex = -1;
      let oldRoomIndex = -1;
      
      for (let floorIndex = 0; floorIndex < hostel.floors.length; floorIndex++) {
        const floor = hostel.floors[floorIndex];
        for (let roomIndex = 0; roomIndex < floor.rooms.length; roomIndex++) {
          if (floor.rooms[roomIndex].roomNumber === hosteller.room) {
            oldRoomFound = true;
            oldFloorIndex = floorIndex;
            oldRoomIndex = roomIndex;
            break;
          }
        }
        if (oldRoomFound) break;
      }
      
      if (oldRoomFound) {
        // Decrease occupancy in old room
        hostel.floors[oldFloorIndex].rooms[oldRoomIndex].occupants -= 1;
        hostel.floors[oldFloorIndex].rooms[oldRoomIndex].occupied = false;
        
        // Increase occupancy in new room
        hostel.floors[newFloorIndex].rooms[newRoomIndex].occupants += 1;
        if (hostel.floors[newFloorIndex].rooms[newRoomIndex].occupants >= 
            hostel.floors[newFloorIndex].rooms[newRoomIndex].capacity) {
          hostel.floors[newFloorIndex].rooms[newRoomIndex].occupied = true;
        }
        
        await hostel.save();
      }
    }
    
    // Update hosteller details
    hosteller.name = name || hosteller.name;
    hosteller.phone = phone || hosteller.phone;
    hosteller.parentPhone = parentPhone || hosteller.parentPhone;
    hosteller.room = room || hosteller.room;
    
    // Update duration if provided
    if (duration) {
      hosteller.duration = parseInt(duration);
      const endDate = new Date(hosteller.joinDate);
      endDate.setMonth(endDate.getMonth() + parseInt(duration));
      hosteller.endDate = endDate;
    }
    
    const updatedHosteller = await hosteller.save();
    
    res.json({
      _id: updatedHosteller._id,
      name: updatedHosteller.name,
      email: updatedHosteller.email,
      phone: updatedHosteller.phone,
      parentPhone: updatedHosteller.parentPhone,
      room: updatedHosteller.room,
      duration: updatedHosteller.duration,
      endDate: updatedHosteller.endDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Exchange rooms between two hostellers
const exchangeRooms = async (req, res) => {
  try {
    const { hosteller1Id, hosteller2Id } = req.body;
    
    // Find both hostellers
    const hosteller1 = await Hosteller.findById(hosteller1Id);
    const hosteller2 = await Hosteller.findById(hosteller2Id);
    
    if (!hosteller1 || !hosteller2) {
      return res.status(404).json({ message: 'One or both hostellers not found' });
    }
    
    // Check if both hostellers belong to warden's hostel
    if (hosteller1.hostel.toString() !== req.user.hostel.toString() || 
        hosteller2.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to update these hostellers' });
    }
    
    // Exchange rooms
    const tempRoom = hosteller1.room;
    hosteller1.room = hosteller2.room;
    hosteller2.room = tempRoom;
    
    // Save both hostellers
    await hosteller1.save();
    await hosteller2.save();
    
    res.json({ 
      message: 'Rooms exchanged successfully',
      hosteller1: {
        _id: hosteller1._id,
        name: hosteller1.name,
        room: hosteller1.room
      },
      hosteller2: {
        _id: hosteller2._id,
        name: hosteller2.name,
        room: hosteller2.room
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Remove hosteller
const removeHosteller = async (req, res) => {
  try {
    const { hostellerId } = req.params;
    
    // Find hosteller
    const hosteller = await Hosteller.findById(hostellerId);
    
    if (!hosteller) {
      return res.status(404).json({ message: 'Hosteller not found' });
    }
    
    // Check if hosteller belongs to warden's hostel
    if (hosteller.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to remove this hosteller' });
    }
    
    // Get hostel to update room occupancy
    const hostel = await Hostel.findById(req.user.hostel);
    
    // Find the room and decrease its occupancy
    let roomFound = false;
    
    for (let floorIndex = 0; floorIndex < hostel.floors.length; floorIndex++) {
      const floor = hostel.floors[floorIndex];
      for (let roomIndex = 0; roomIndex < floor.rooms.length; roomIndex++) {
        if (floor.rooms[roomIndex].roomNumber === hosteller.room) {
          hostel.floors[floorIndex].rooms[roomIndex].occupants -= 1;
          hostel.floors[floorIndex].rooms[roomIndex].occupied = false;
          roomFound = true;
          break;
        }
      }
      if (roomFound) break;
    }
    
    // Update hostel occupied rooms count if needed
    if (roomFound && hostel.occupiedRooms > 0) {
      hostel.occupiedRooms -= 1;
      await hostel.save();
    }
    
    // Delete hosteller
    await Hosteller.findByIdAndDelete(hostellerId);
    
    res.json({ message: 'Hosteller removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all hostellers for warden's hostel
const getAllHostellers = async (req, res) => {
  try {
    const hostellers = await Hosteller.find({ hostel: req.user.hostel })
      .select('-password');
    
    res.json(hostellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get complaints for warden's hostel
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ hostel: req.user.hostel })
      .populate('hosteller', 'name email room');
    
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Respond to complaint
const respondToComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, wardenResponse } = req.body;
    
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    if (complaint.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this complaint' });
    }
    
    // Update complaint
    complaint.status = status;
    complaint.wardenResponse = wardenResponse;
    
    const updatedComplaint = await complaint.save();
    
    res.json(updatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get maintenance requests for warden's hostel
const getMaintenanceRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({ hostel: req.user.hostel })
      .populate('hosteller', 'name email room');
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Respond to maintenance request
const respondToMaintenance = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, wardenResponse, scheduledDate } = req.body;
    
    const request = await Maintenance.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    
    if (request.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }
    
    // Update request
    request.status = status;
    request.wardenResponse = wardenResponse;
    if (scheduledDate) {
      request.scheduledDate = scheduledDate;
    }
    
    const updatedRequest = await request.save();
    
    res.json(updatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create event
const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    
    const event = await Event.create({
      title,
      description,
      date,
      hostel: req.user.hostel
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get events for warden's hostel
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ hostel: req.user.hostel })
      .populate('participants', 'name email room');
    
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get rent payment status for warden's hostel
const getRentPaymentStatus = async (req, res) => {
  try {
    const hostellers = await Hosteller.find({ hostel: req.user.hostel })
      .select('name email room rentPaid lastRentPayment');
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get all payments for current month
    const payments = await Payment.find({
      hostel: req.user.hostel,
      forMonth: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });
    
    res.json({
      hostellers,
      payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get warden dashboard stats
const getWardenStats = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.user.hostel);
    const totalHostellers = await Hosteller.countDocuments({ hostel: req.user.hostel });
    
    const pendingComplaints = await Complaint.countDocuments({ 
      hostel: req.user.hostel, 
      status: 'pending' 
    });
    const pendingMaintenance = await Maintenance.countDocuments({ 
      hostel: req.user.hostel, 
      status: 'pending' 
    });
    
    // Count hostellers with unpaid rent
    const unpaidRent = await Hosteller.countDocuments({ 
      hostel: req.user.hostel, 
      rentPaid: false 
    });
    
    // Check for hostellers whose stay is about to expire (in next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringStays = await Hosteller.countDocuments({
      hostel: req.user.hostel,
      endDate: { $lte: thirtyDaysFromNow }
    });
    
    res.json({
      totalRooms: hostel.totalRooms,
      occupiedRooms: hostel.occupiedRooms,
      availableRooms: hostel.totalRooms - hostel.occupiedRooms,
      totalHostellers,
      pendingComplaints,
      pendingMaintenance,
      unpaidRent,
      expiringStays
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Check if room architecture is defined
const checkRoomArchitecture = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.user.hostel);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    res.json({
      isRoomArchitectureDefined: hostel.isRoomArchitectureDefined,
      floors: hostel.floors || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Define room architecture for warden's hostel
const defineRoomArchitecture = async (req, res) => {
  try {
    const { floors } = req.body;
    
    // Find the hostel
    const hostel = await Hostel.findById(req.user.hostel);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Validate floors structure
    if (!Array.isArray(floors) || floors.length === 0) {
      return res.status(400).json({ message: 'Invalid floors data' });
    }
    
    // Verify each floor has a name and rooms
    for (const floor of floors) {
      if (!floor.floorName || !Array.isArray(floor.rooms) || floor.rooms.length === 0) {
        return res.status(400).json({ message: 'Each floor must have a name and at least one room' });
      }
      
      // Verify each room has a room number and capacity
      for (const room of floor.rooms) {
        if (!room.roomNumber) {
          return res.status(400).json({ message: 'Each room must have a room number' });
        }
        
        // Set default capacity if not provided
        if (!room.capacity) {
          room.capacity = 1;
        }
      }
    }
    
    // Count total rooms across all floors
    const totalRoomsInArchitecture = floors.reduce((total, floor) => 
      total + floor.rooms.length, 0);
    
    // Update hostel with room architecture
    hostel.floors = floors;
    hostel.isRoomArchitectureDefined = true;
    hostel.totalRooms = totalRoomsInArchitecture;
    
    await hostel.save();
    
    res.json({
      message: 'Room architecture defined successfully',
      isRoomArchitectureDefined: true,
      totalRooms: totalRoomsInArchitecture,
      floors: hostel.floors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getHostelInfo,
  addHosteller,
  getHostellerDetails,
  resetHostellerPassword,
  updateHosteller,
  removeHosteller,
  exchangeRooms,
  getAllHostellers,
  getComplaints,
  respondToComplaint,
  getMaintenanceRequests,
  respondToMaintenance,
  createEvent,
  getEvents,
  getRentPaymentStatus,
  getWardenStats,
  checkRoomArchitecture,
  defineRoomArchitecture
}