# 📝 Simple Blog – Full Stack Web App

A complete full-stack blog application developed using **React (Vite)** for the frontend and **Node.js + Express** for the backend. The app allows users to view, create, and manage blog posts via a user-friendly interface and a robust API.

## 📁 Project Structure

```
simple-blog/
├── backend/              # Backend API using Node.js & Express
│   ├── server.js
│   ├── .env              # Contains environment variables
│   ├── package.json
│   ├── serviceAccountKey.json (if using Firebase)
│   └── node_modules/
├── frontend/             # React frontend built with Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── App.css
│   │   └── assets/
│   ├── public/
│   │   └── vite.svg
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
└── README.md
```

## 🚀 Technologies Used

### 🔹 Frontend
- React with Vite
- JSX, CSS Modules
- ESLint (optional)
- React Hooks
- Axios (for HTTP requests)

### 🔹 Backend
- Node.js
- Express.js
- dotenv (for environment variables)
- CORS middleware
- Firebase Admin SDK (optional – for `serviceAccountKey.json`)

## 🛠️ Getting Started Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Divya9924/Simple-Blog.git
cd simple-blog
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
node server.js
```

- Backend runs at: `http://localhost:5000`

If using Firebase or other integrations, create a `.env` file:

```
PORT=5000
```

### 3️⃣ Frontend Setup

Open another terminal window:

```bash
cd frontend
npm install
npm run dev
```

- Frontend runs at: `http://localhost:5173`

## ✨ Features

- ✅ Create and manage blog posts
- ✅ Simple and clean UI
- ✅ Backend API with Express
- ✅ Easily extendable (add MongoDB, Auth, etc.)
- ✅ Organized folder structure


## 📸 Screenshots

![image](https://github.com/user-attachments/assets/ed14b41e-db0a-4c40-8ff5-f733b1165bc8)


## 🙋‍♀️ Author

**Divya Sai Sri Murugudu**  
🔗 [GitHub](https://github.com/Divya9924)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
