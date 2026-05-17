# Gram-Suvidha AI

An intelligent, full-stack web application designed to modernize rural governance by streamlining Gram Panchayat administration. 

This repository currently contains the **Frontend UI** built with React.js, Vite, and Tailwind CSS.

## Prerequisites

Before running this project, you must have the following installed on your system:
- **Node.js** (v18 or higher recommended)
- **npm** (comes automatically when you install Node.js)

You can download Node.js from standard official sources: https://nodejs.org/

---

## 🚀 How to Run the Project (Step-by-Step)

If you have received this project as a ZIP file, extract it to a folder first. Then, open your terminal (Command Prompt, PowerShell, or VS Code Terminal) and follow these exact steps:

### Step 1: Navigate to the project folder
Open your terminal and use the `cd` command to navigate to the exact folder where you extracted the project. 
*(If you opened the folder directly in VS Code, you can skip this step and just open the built-in terminal).*
```bash
cd path/to/gram-suvidha-ai
```

### Step 2: Install dependencies
Before running the app for the first time, you need to download all the required packages. Run the following command:
```bash
npm install
```
*(Wait a few moments for this command to finish. It will download the React framework, Tailwind CSS, Lucide icons, etc.)*

### Step 3: Start the development server
Once the installation is complete, you can start the application by running:
```bash
npm run dev
```

### Step 4: Open in your Browser
After running the command above, your terminal will display a local link (usually `http://localhost:5173/`). 
- **Ctrl + Click** the link in your terminal, OR
- Open your browser (Chrome/Edge/Firefox) manually and go to **http://localhost:5173**

---

## 🌟 Exploring the Frontend
The frontend features a role-based login system. You can interact with the mockups without a backend server currently connected:

1. **Citizen Portal**
   - Select "Citizen Login" and click Sign In.
   - Explore the Scheme eligibility checker by entering Age and Income.
   - Interact with the Complaint categorization flow.

2. **Admin/Panchayat Portal**
   - Select "Admin Login" and click Sign In.
   - Explore the AI data insights, priority tables, and report functionalities.
