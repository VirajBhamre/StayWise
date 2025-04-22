// Generate random password
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate username from email
const generateUsername = (email) => {
  // Extract part before @ and add random digits
  const baseUsername = email.split('@')[0];
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${baseUsername}${randomDigits}`;
};

// Generate hostel ID
const generateHotelId = () => {
  const prefix = 'HST-';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + id;
};

module.exports = {
  generateRandomPassword,
  generateUsername,
  generateHotelId
};