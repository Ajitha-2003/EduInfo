# EduBot — Intelligent Study Material Hub

A Next.js web app with three role-based portals (Admin, Staff, Student) and an AI-powered chatbot for study material delivery.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Default Credentials

| Role    | Username | Password   |
|---------|----------|------------|
| Admin   | admin    | admin123   |
| Staff   | (added by admin) | |
| Student | (added by admin) | |

---

## 📁 Project Structure

```
edubot/
├── pages/
│   ├── index.js              # Landing page with 3 login portals
│   ├── admin/
│   │   └── dashboard.js      # Admin: manage users & view materials
│   ├── staff/
│   │   └── dashboard.js      # Staff: upload & manage study materials
│   └── student/
│       └── dashboard.js      # Student: hub + floating chatbot
├── lib/
│   └── store.js              # localStorage data layer
├── styles/
│   └── globals.css           # Global styles & design tokens
├── vercel.json               # Vercel deployment config
└── package.json
```

---

## ✨ Features

### Admin Portal
- Add/remove Staff and Student accounts
- View all uploaded materials
- Delete any material

### Staff Portal
- Upload study materials with: Title, Year (1–4), Subject, Content, Optional link
- View and delete their own uploads

### Student Portal
- Dashboard with material stats
- **Floating chatbot** (bottom-right corner)
  - Say "Hi" to start
  - Bot asks for Year → Subject
  - Returns matching materials inline
  - Download materials as `.txt` files
  - Click external links

---

## ☁️ Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **New Project** → Import your repo
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy** ✅

> **Note**: Data is stored in localStorage (browser-side). For production with a real database, swap `lib/store.js` to use a backend (e.g. Supabase, MongoDB, Firebase).

---

## 🎨 Design System

- **Font**: Sora (Google Fonts)
- **Admin color**: `#FF6B35` (Orange)
- **Staff color**: `#2D9CDB` (Blue)
- **Student color**: `#27AE60` (Green)
- Dark theme with subtle grid background

---

## 🔄 Upgrade Path (Production)

To scale beyond localStorage:
1. Replace `lib/store.js` with API calls
2. Add a backend (Next.js API routes + database)
3. Use NextAuth.js for real authentication
4. Store files in S3/Cloudinary for actual PDF uploads
