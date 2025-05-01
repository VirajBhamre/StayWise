StayWise is a robust Hostel Management System built with Node.js, Express, and MongoDB! 🚀

This system features a comprehensive multi-tier architecture with three distinct user roles:

Admin Workflow:
1️⃣ Approves hostel registration requests from wardens 
2️⃣ Monitors system-wide statistics and occupancy rates 
3️⃣ Manages the entire network of hostels with a single administrator account 
4️⃣ Features an emergency account recovery system if admin credentials are lost

Warden Workflow:
1️⃣ Registers their hostel for admin approval 
2️⃣ Defines room architecture with intelligent pattern detection (automatically suggests rooms like 101-110 or A101-A110) 
3️⃣ Manages hostellers with auto room assignment and credential generation 
4️⃣ Processes maintenance requests, rent payments, and room exchanges 
5️⃣ Tracks financial analytics and generates payment receipts

Hosteller Experience:
1️⃣ Receives auto-generated credentials from their warden 
2️⃣ Submits maintenance requests that are tracked through status updates 
3️⃣ Pays rent (currently using a dummy payment gateway implementation) 
4️⃣ Views payment history with detailed receipts 
5️⃣ Participates in hostel events

Technical Highlights:
🔹 JWT-based Authentication: Secure role-based access control with proper middleware segregation 
🔹 MongoDB Schema Design: Complex relationships between hostels, rooms, hostellers, and payments 
🔹 Smart Room Management: Pattern detection algorithms that intelligently suggest room patterns 
🔹 Hostel Architecture Definition: Flexible schema that supports multi-floor configurations with variable room capacities 
🔹 Payment Processing System: Complete tracking architecture with status monitoring and receipt generation

The backend follows clean architecture principles with proper separation of controllers, models, and middleware, featuring thorough error handling and security considerations throughout.
