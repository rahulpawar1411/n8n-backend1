# Chat History API

A simple and robust Node.js backend to manage AI chat history using Express and MySQL.

## 🚀 Features
- Health check endpoint
- Save chat history to MySQL
- Fetch all chat history
- Filter chat by session and agent type
- Modern `async/await` syntax with error handling
- parameterized queries for security

## 🛠️ Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MySQL](https://www.mysql.com/) server running

## ⚙️ Setup Instructions

### 1. Clone or Copy the Files
Ensure all the project files are in your desired directory.

### 2. Database Setup
Create the table in your MySQL database using the following SQL:
```sql
CREATE TABLE ai_chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_type VARCHAR(255),
    sessionid VARCHAR(255),
    user TEXT,
    ai TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Install Dependencies
Run the following command in your terminal:
```bash
npm install
```

### 4. Configure Environment
Create a `.env` file in the root directory (you can copy `.env.example`) and fill in your details:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_db_name
PORT=5000
```

### 5. Run the Server
Start the server using:
```bash
npm start
```
For development with auto-reload:
```bash
npm run dev
```

---

## 📡 API Endpoints & Postman Samples

### 1. Health Check
- **Method**: `GET`
- **URL**: `http://localhost:5000/`
- **Sample Request**: No body required.

### 2. Save Chat
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/chat`
- **Option A (Simple Body)**:
```json
{
  "agent_type": "demo1",
  "sessionid": "0101",
  "user": "Hello!",
  "ai": "Hi!"
}
```
- **Option B (Nested Body - works for n8n/Postman)**:
```json
{
  "body": {
    "agent": "realstate",
    "sessionId": "0101",
    "message": "who are you?",
    "output": "I am your AI assistant."
  }
}
```
*(Note: You can use `ai` or `output` for the AI response)*

### 3. Get All History
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/chat`

### 4. Get by Agent Type Only
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/chat/realstate` (returns all records for realstate)

### 5. Get Specific History (Agent + Session)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/chat/realstate/0101`
