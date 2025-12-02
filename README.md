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



### **SYSTÈME DE CHANGEMENT DE LOCALISATION HIÉRARCHIQUE**

| Méthode | Endpoint | Description | Paramètres | Corps de la Requête (JSON) |
|---------|----------|-------------|------------|----------------------------|
| **POST** | `/api/location-change` | Créer une demande de changement de localisation | - | `equipmentId`, `requestedRoom`, `reason`, `requestedBy`, `department` |
| **GET** | `/api/location-change/pending` | Obtenir toutes les demandes en attente d'approbation | - | - |
| **PUT** | `/api/location-change/:id/approve` | Approuver une demande de changement | `id` (path) | `reviewNotes`, `reviewedBy` |
| **PUT** | `/api/location-change/:id/reject` | Rejeter une demande de changement | `id` (path) | `reviewNotes`, `reviewedBy` |
| **GET** | `/api/location-change/history/:equipmentId` | Obtenir l'historique des changements d'un équipement | `equipmentId` (path) | - |

---

## 📝 DÉTAIL DES ENDPOINTS

### **1. Créer une demande de changement**

**Endpoint:** `POST /api/location-change`

**Exemple de requête:**
```bash
curl -X POST http://localhost:3000/api/location-change \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "691dbcf47c0864e6fbe7636a",
    "requestedRoom": "LI2",
    "reason": "Transfert pour projet de recherche",
    "requestType": "transfer",
    "requestedBy": "Professeur Martin",
    "department": "Informatique",
    "priority": "medium",
    "notes": "Utilisation pour le laboratoire d'IA"
  }'
```

**Paramètres requis:**
```javascript
{
  "equipmentId": "string (ObjectId)",      // ID de l'équipement
  "requestedRoom": "string",               // Code de la salle (ex: "LI2")
  "reason": "string",                      // Raison du déplacement (max 500 chars)
  "requestedBy": "string",                 // Nom de la personne qui demande
  "department": "string"                   // Département
}
```

**Paramètres optionnels:**
```javascript
{
  "requestType": "string",                 // transfer|repair|maintenance|inventory|other
  "priority": "string",                    // low|medium|high|urgent
  "notes": "string"                        // Notes supplémentaires
}
```

**Réponse réussie (201):**
```json
{
  "success": true,
  "message": "Demande de changement de localisation créée avec succès",
  "requestId": "67890abcdef1234567890cd",
  "request": {
    "id": "67890abcdef1234567890cd",
    "equipment": "Epson WorkForce Pro Printer",
    "from": "LI1",
    "to": "LI2",
    "status": "pending",
    "requestedAt": "2024-12-19T10:30:00.000Z"
  }
}
```

**Codes d'erreur:**
- `400`: Demande déjà en attente pour cet équipement
- `404`: Équipement ou salle non trouvé
- `500`: Erreur serveur

---

### **2. Obtenir les demandes en attente**

**Endpoint:** `GET /api/location-change/pending`

**Exemple de requête:**
```bash
curl http://localhost:3000/api/location-change/pending
```

**Réponse réussie (200):**
```json
{
  "success": true,
  "message": "2 demandes en attente",
  "count": 2,
  "requests": [
    {
      "_id": "67890abcdef1234567890cd",
      "equipment": {
        "_id": "691dbcf47c0864e6fbe7636a",
        "name": "Epson WorkForce Pro Printer",
        "serialNumber": "EPSONPRINT001",
        "model": "WF-7840"
      },
      "currentLocation": {
        "building": "Département Informatique",
        "room": "LI1",
        "department": "Informatique"
      },
      "requestedLocation": {
        "building": "Département Informatique",
        "room": "LI2",
        "department": "Informatique"
      },
      "reason": "Transfert pour projet de recherche",
      "requestedBy": {
        "userName": "Professeur Martin",
        "department": "Informatique"
      },
      "status": "pending",
      "priority": "medium",
      "requestedDate": "2024-12-19T10:30:00.000Z"
    }
  ]
}
```

---

### **3. Approuver une demande**

**Endpoint:** `PUT /api/location-change/:id/approve`

**Exemple de requête:**
```bash
curl -X PUT http://localhost:3000/api/location-change/67890abcdef1234567890cd/approve \
  -H "Content-Type: application/json" \
  -d '{
    "reviewNotes": "Approuvé pour le projet de recherche IA",
    "reviewedBy": "Admin Système"
  }'
```

**Paramètres optionnels:**
```javascript
{
  "reviewNotes": "string",     // Notes de l'admin (max 500 chars)
  "reviewedBy": "string",      // Nom de l'administrateur
  "effectiveDate": "string"    // Date ISO (défaut: maintenant)
}
```

**Réponse réussie (200):**
```json
{
  "success": true,
  "message": "Changement de localisation approuvé et appliqué",
  "equipment": {
    "id": "691dbcf47c0864e6fbe7636a",
    "name": "Epson WorkForce Pro Printer",
    "newLocation": {
      "building": "Département Informatique",
      "room": "LI2",
      "department": "Informatique",
      "lastUpdated": "2024-12-19T10:35:00.000Z"
    }
  },
  "request": {
    "id": "67890abcdef1234567890cd",
    "status": "approved",
    "reviewedAt": "2024-12-19T10:35:00.000Z"
  }
}
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


