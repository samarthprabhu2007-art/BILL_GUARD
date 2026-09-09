# SubTrackr 💳

> Never miss a subscription payment again.

**SubTrackr** is a clean and minimal web app for tracking recurring subscriptions and bills in one place.

Keep track of your subscriptions, see how much you're spending, know what's due soon, and remove subscriptions you no longer need.

## 🌐 Live Demo

**Try SubTrackr:**
https://bill-guard-pink.vercel.app/

---

## ✨ Features

* 🔐 **Authentication** — Sign up and log in with email/password
* ➕ **Add Subscriptions** — Add service name, amount, category, billing cycle and start date
* 📊 **Dashboard** — View all subscriptions in one place
* ⚠️ **Due Soon Alerts** — Highlights subscriptions due within 7 days
* 🧠 **Smart Due Dates** — Automatically calculates the next payment date
* 🗑️ **Remove Subscriptions** — Delete subscriptions with one click
* ☁️ **Cloud Sync** — Subscription data is stored in MongoDB
* 📱 **Responsive Design** — Works on desktop and mobile devices

---

## 🖥️ Dashboard

The dashboard provides an overview of your subscriptions, including:

* 💰 **Total Spend**
* 📋 **Active Subscriptions**
* ⚠️ **Subscriptions Due Soon**
* 📅 **Next Due Date**
* 🏷️ **Category**
* 💳 **Billing Cycle**
* 🚦 **Payment Status**

---

## 🛠️ Tech Stack

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend  | Vercel Serverless Functions   |
| Runtime  | Node.js                       |
| Database | MongoDB Atlas                 |
| Hosting  | Vercel                        |

---

## 💳 Billing Cycles

SubTrackr currently supports:

| Cycle             | Description            |
| ----------------- | ---------------------- |
| 🔵 One Time       | Single one-off payment |
| 🟢 Monthly        | Renews every month     |
| 🟡 Every 15 Days  | Renews every 15 days   |
| 🟣 Every 6 Months | Renews every 6 months  |

---

## 🚦 Subscription Status

SubTrackr automatically determines the status of each subscription based on its next due date.

| Status      | Meaning                         |
| ----------- | ------------------------------- |
| 🟢 Active   | Payment is not due soon         |
| 🟡 Due Soon | Payment is due within 7 days    |
| 🔴 Overdue  | Payment date has already passed |

---

## ⚙️ How It Works

1. **Create an account** using your name, email and password.
2. **Log in** to access your dashboard.
3. **Add a subscription** by entering:

   * Service name
   * Amount
   * Billing cycle
   * Start/due date
   * Category
4. SubTrackr automatically calculates the **next due date**.
5. Your dashboard displays the subscription and its current **status**.
6. Subscriptions are stored in **MongoDB Atlas** so your data persists.
7. Remove subscriptions whenever you no longer need them.

---

## 📁 Project Structure

```text
subtrackr/
│
├── api/
│   ├── login.js       # Handles user authentication
│   ├── users.js       # Creates and fetches users
│   └── subs.js        # Saves and fetches subscriptions
│
├── index.html         # Dashboard
├── login.html         # Login / Signup page
├── script.js          # Frontend logic
├── style.css          # Application styles
├── vercel.json        # Vercel configuration
├── package.json       # Project dependencies
└── README.md
```

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd bill-guard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure MongoDB

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/billguard?retryWrites=true&w=majority
```

> **Note:** If your MongoDB password contains special characters such as `@`, URL-encode them. For example, `@` becomes `%40`.

### 4. Run the project

```bash
npx vercel dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## ☁️ Deployment

SubTrackr is already deployed using **Vercel**.

### Live Application

https://bill-guard-pink.vercel.app/

The application uses:

* **Vercel** for hosting and serverless API functions
* **MongoDB Atlas** for persistent data storage

---

## 🔒 Security

> ⚠️ **Current status:** Passwords are currently stored in plain text for simplicity.

This project is currently intended as a learning/personal project.

A future update will improve authentication security by:

* Hashing passwords using a library such as `bcrypt`
* Improving session management
* Adding stronger authentication practices
* Protecting API endpoints more securely

**Do not use the current authentication implementation for sensitive or production applications.**

---

## 🔮 Future Improvements

Some features planned for future versions:

* 🔐 Secure password hashing
* 🔑 Better authentication and session management
* 📧 Email reminders for upcoming payments
* 🔔 Push notifications
* 📈 Spending analytics and charts
* 🔎 Search and filter subscriptions
* ✏️ Edit existing subscriptions
* 🌓 Dark mode
* 💰 Monthly/yearly spending summaries
* 📊 Category-based spending breakdown
* 🔄 More billing cycles
* 📱 Improved mobile experience

---

## 📌 Project Status

**Currently deployed and functional.**

SubTrackr is an ongoing project, with additional features and security improvements planned for future versions.

---

## 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify and distribute the project.

---

Made with ❤️ by **Samarth Prabhu**
