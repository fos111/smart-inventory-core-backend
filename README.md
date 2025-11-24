# Smart Equipment Inventory Management System

A Node.js backend application for managing equipment inventory with QR code integration. This system allows you to track equipment details, generate QR codes for easy scanning, and manage records.

## 🚀 Features

- **Equipment Management**: Full CRUD operations for equipment tracking
- **QR Code Generation**: Generate QR codes that link to equipment details
- **Maintenance Tracking**: Record and track equipment maintenance history
- **Advanced Search**: Filter equipment by category, status, department, and more
- **RESTful API**: Clean API design with proper error handling

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **QR Generation**: qrcode library
- **Validation**: Joi for request validation
- **Environment**: dotenv for configuration

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Configure your environment variables:
     ```env
     PORT=3000
     MONGODB_URI=your_mongodb_connection_string
     NODE_ENV=development
     FRONTEND_URL=http://localhost:3001
     ```

4. **Start the application**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Current Equipment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/equipment` | Get all equipment with filtering |
| GET | `/api/equipment/:id` | Get specific equipment details |
| POST | `/api/equipment` | Create new equipment |
| PUT | `/api/equipment/:id` | Update equipment metadata |
| DELETE | `/api/equipment/:id` | Soft delete equipment |
| POST | `/api/equipment/:id/generate-qr` | Generate QR code for equipment |

## Movement Tracking (/api/movements)

| Method | Endpoint | Description | Parameters / Body |
|---|---:|---|---|
| POST | /api/movements/equipment/:equipmentId/move | Move equipment to new room | Path: equipmentId (ObjectId / serial / assetTag). Body: newRoomId OR newRoomCode + reason |
| GET | /api/movements/equipment/:equipmentId/history | Get movement history | Path: equipmentId (ObjectId / serial / assetTag) |
| POST | /api/movements/rfid-detection | Handle RFID automatic detection | Body: readerId, equipmentTag, eventType |

## Rooms Management (/api/rooms)



| Method | Endpoint | Description |
|---|---:|---|
| GET | /api/rooms | Toutes les salles |
| GET | /api/rooms/with-rfid | Salles avec RFID |
| GET | /api/rooms/type/:type | Salles par type |
| GET | /api/rooms/building/:building | Salles par bâtiment |
| GET | /api/rooms/:id | Salle spécifique (ID ou code) |
| POST | /api/rooms | Créer une salle |
| PATCH | /api/rooms/:id/rfid-readers | Ajouter lecteur RFID |
| GET | /api/rooms/:id/rfid-stats | Statistiques RFID

### Health Check
- `GET /health` - API status and database connection

## 🎯 Quick Start
 
1. **Create your first equipment:**
   ```bash
   POST /api/equipment
   {
     "name": "PC X100",
     "model": "MX100",
     "serialNumber": "MICRO001",
     "category": "Computeur",
     "specifications": {
       "manufacturer": "Test Inc"
     }
   }
   ```

2. **Generate a QR code:**
   ```bash
   POST /api/equipment/:id/generate-qr
   {
     "width": 300,
     "margin": 2
   }
   ```

## 📁 Project Structure

```
smart-inventory/
├── models/           # MongoDB schemas
├── controllers/      # Business logic
├── routes/           # API routes
├── middleware/       # Custom middleware
├── validation/       # Request validation schemas
├── services/         # Business services
└── server.js         # Application entry point
```

## 🔧 Development Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)



## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request


