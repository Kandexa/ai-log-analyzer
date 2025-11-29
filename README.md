🚀 Kandexa AI Log Analyzer

A Smart Log Analysis Dashboard – Node.js + MongoDB + AI Error Insight

Kandexa AI Log Analyzer is a full-stack mini-product designed to analyze server log files, classify log levels (INFO / WARNING / ERROR), store entries in MongoDB, and visualize results through a modern dashboard.
It also includes an AI-style Error Insight module that automatically explains the latest ERROR log in human-friendly technical language.

This project represents a simplified version of real-world log platforms such as Datadog, ELK Stack, and Sentry — ideal for showcasing Full-Stack + AI engineering skills.

✨ Features
📂 Log Upload

Upload .log or .txt files through a simple browser form (Multer-powered).

🔍 Line-by-Line Parsing

Each log line is parsed using the format: YYYY-MM-DD HH:mm:ss [LEVEL] Message...
Extracted fields:

Timestamp

Level (INFO / WARNING / ERROR / UNKNOWN)

Message

🗄️ MongoDB Storage

Each parsed line is saved as a MongoDB document to persist log history.

📊 Interactive Dashboard

A clean and modern UI displaying:

Total log count

INFO / WARNING / ERROR distribution

Latest logs table with colored level badges

Auto-refresh support

🤖 AI Error Insight

Automatically analyzes the latest ERROR log and provides a rule-based, human-readable explanation such as:

“ECONNREFUSED” → The database connection was refused. Service may be down or port is incorrect.

Works fully offline — no external AI API required.

🧠 Tech Stack

Backend

Node.js (Express)

Multer (file upload)

Mongoose (ORM)

MongoDB (Atlas or local)

Frontend

HTML5

Vanilla JavaScript

Bootstrap 5

Other

Regex parsing

fs + readline

dotenv

REST API architecture

📁 Project Structure
ai-log-analyzer/
│
├─ client/
│   └─ index.html         # Dashboard UI + Upload + Stats + AI Insight
│
├─ server/
│   ├─ server.js          # Express API (upload, stats, logs, explain)
│   ├─ config/
│   │    └─ db.js         # MongoDB connection
│   ├─ models/
│   │    └─ Log.js        # Log schema/model
│   └─ uploads/           # Temporary upload folder (ignored by Git)
│
├─ .gitignore
└─ README.md

⚙️ Installation & Setup
1️⃣ Backend Setup : 
cd server
npm install

Create a .env file:
MONGO_URI=your_mongodb_connection_string
PORT=5000

Run the server:
node server.js

You should see:
Server listening on http://localhost:5000
🔥 RUNNING SERVER.JS FILE: server/server.js

2️⃣ Frontend (Dashboard)

No build step required.

Simply open:
client/index.html
in your browser.
The dashboard will automatically:
-Show stats
-Show latest logs
-Generate error explanations
-Refresh data after each upload

🔗 API Endpoints
POST /api/logs/upload

Upload & analyze a log file, then store all entries.

GET /api/stats

Returns total log count + level-based statistics.

GET /api/logs-all

Fetches the latest 50 log entries.

GET /api/logs/last-error-explain

Generates an AI-style explanation for the latest ERROR log.

GET /api/health

Simple backend health-check endpoint.

🤖 How AI Error Insight Works

This module uses a rule-based analysis engine (no external AI API).
It inspects the latest ERROR log and provides technical guidance.

| Error Pattern      | Explanation                                                |
| -------------------|----------------------------------------------------------- |
| ECONNREFUSED       | Database/service connection refused. Port or service issue.|
| undefined / null   | JS tried to access a property of null/undefined.           |
| timeout            | The request took too long; slow backend or network issue.  |
| ENOENT / not found | File or resource was not found.                            |
| permission denied  | Missing OS or filesystem permissions.                      |

📸 Screenshot

(Add your screenshot here)
![Kandexa Log Analyzer Dashboard](./screenshot.png)

🚀 Future Improvements

JWT Authentication (login system)

Date-range log filtering

Chart.js visualizations

Full-text search

Real LLM API integration for richer explanations

Error trend charts

👤 Author

Mehmet Celil Kandemir
Full-Stack & AI Developer
Kandexa Ecosystem

“This project was built as a realistic mini-product to demonstrate practical full-stack and AI engineering capabilities.”

