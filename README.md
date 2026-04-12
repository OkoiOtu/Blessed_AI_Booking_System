# AI Booking System — Phase 1

An AI-driven call handling and booking system that automatically answers inbound phone calls, collects booking information, confirms hourly transportation bookings, and provides an admin dashboard.

---

## Stack

| Layer | Technology |
|---|---|
| Phone + SMS | Twilio |
| AI Voice Agent | Vapi.ai |
| Backend API | Node.js + Express |
| Database | PocketBase |
| Dashboard | Next.js |

---

## Local setup

### Prerequisites
- Node.js v18+
- PocketBase binary (see below)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd ai-booking-system

# Install backend dependencies
cd backend && npm install

# Install dashboard dependencies
cd ../dashboard && npm install
```

### 2. Set up PocketBase

Download the PocketBase binary from https://pocketbase.io/docs and place it in the `pocketbase/` folder.

```bash
cd pocketbase
./pocketbase serve
```

Open http://127.0.0.1:8090/_/ and create your superuser account.

### 3. Configure environment variables

```bash
# Backend
cd backend
cp .env.example .env
# Fill in your PocketBase, Twilio, and Vapi credentials

# Dashboard
cd ../dashboard
cp .env.example .env
# Fill in your PocketBase and backend URLs
```

### 4. Create the first admin user

Open PocketBase admin UI at http://127.0.0.1:8090/_/
- Go to Collections → users
- Create a new record with role set to `admin`
- This is the account you will use to log into the dashboard

### 5. Run everything

```bash
# Terminal 1 — PocketBase
cd pocketbase && ./pocketbase serve

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — Dashboard
cd dashboard && npm run dev
```

Dashboard: http://localhost:3001  
PocketBase admin: http://127.0.0.1:8090/_/  
Backend health: http://localhost:3000/health

---

## Vapi assistant setup

See `backend/vapi-assistant-config.js` for the full system prompt and structured data schema to paste into your Vapi dashboard.

---

## Testing the webhook locally

Use ngrok to expose your backend:

```bash
ngrok http 3000
```

Set the Vapi webhook URL to: `https://your-ngrok-url.ngrok.io/webhook/vapi`

---

## Project structure

```
ai-booking-system/
├── backend/          # Express API — webhook, booking rules, SMS
├── dashboard/        # Next.js admin dashboard
├── pocketbase/       # PocketBase binary + migrations + data
├── docker-compose.yml
└── README.md
```
