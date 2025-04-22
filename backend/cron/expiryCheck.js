const cron = require('node-cron');
const Hosteller = require('../models/hostellerModel');
const Hostel = require('../models/hostelModel');

// Function to check for expired hostellers and remove them
const checkExpiredHostellers = async () => {
  try {
    console.log('Running hosteller expiry check...');
    const currentDate = new Date();
    
    // Find hostellers whose stay has expired
    const expiredHostellers = await Hosteller.find({
      endDate: { $lt: currentDate }
    });
    
    if (expiredHostellers.length > 0) {
      console.log(`Found ${expiredHostellers.length} expired hostellers to remove`);
      
      for (const hosteller of expiredHostellers) {
        // Get hostel to update room occupancy
        const hostel = await Hostel.findById(hosteller.hostel);
        
        if (hostel) {
          // Find and update the room occupancy
          for (const floor of hostel.floors) {
            for (let i = 0; i < floor.rooms.length; i++) {
              if (floor.rooms[i].roomNumber === hosteller.room) {
                floor.rooms[i].occupants -= 1;
                floor.rooms[i].occupied = floor.rooms[i].occupants >= floor.rooms[i].capacity;
                break;
              }
            }
          }
          
          // Update hostel's occupied rooms count
          if (hostel.occupiedRooms > 0) {
            hostel.occupiedRooms -= 1;
          }
          
          await hostel.save();
        }
        
        // Delete the hosteller
        await Hosteller.findByIdAndDelete(hosteller._id);
        console.log(`Removed expired hosteller: ${hosteller.name} (${hosteller.email})`);
      }
    } else {
      console.log('No expired hostellers found');
    }
  } catch (error) {
    console.error('Error in expiry check:', error);
  }
};

// Schedule the job to run daily at midnight
const scheduleExpiryCheck = () => {
  cron.schedule('0 0 * * *', checkExpiredHostellers);
  console.log('Scheduled daily hosteller expiry check');
};

module.exports = { scheduleExpiryCheck, checkExpiredHostellers };