# 🐞 Bug Auction System

A web-based platform to conduct a live **Bug Auction Event**, where teams bid on bugs (questions), solve them, and earn profit based on Return on Investment (ROI).

This project is being developed using **Next.js** and **MongoDB** as part of an academic/event requirement.

---

## 📌 Project Status

🚧 **Currently in development (Initial Phase)**
Core features and structure are being implemented.

---

## 🎯 Objective

To create a system that manages a complete bug auction event including:

* Room creation by admin
* Team participation
* Live auction of bugs
* Bug solving phase
* Automated ROI calculation
* Leaderboard generation

---

## 🧠 Concept Overview

The system simulates an auction-based competition:

1. Teams receive virtual money.
2. Admin auctions bugs (questions).
3. Teams acquire bugs by bidding.
4. Teams solve purchased bugs.
5. Profit is calculated as:

```
Profit = Market Value − Purchase Price
```

Winner = Team with highest total profit.

---

## 🏗️ Planned Features

### 👨‍💼 Admin Features

* Admin authentication
* Create auction room
* Generate and share Room ID
* Auction dashboard
* Assign bugs to teams
* Start solving phase
* End contest

---

### 👥 Team Features

* Team login
* Join using Room ID
* View auction status
* Track remaining balance
* View allotted bugs
* Submit solutions
* View leaderboard

---

### 📊 System Features

* Live updates using periodic database polling
* ROI-based scoring
* Multi-language bug support
* Automatic redirection between phases
* Final leaderboard display

---

## 🧰 Tech Stack

* **Frontend & Backend:** Next.js
* **Database:** MongoDB
* **ORM:** Mongoose
* **Styling:** (To be decided)
* **Deployment:** (Planned)

---

## 🗂️ Planned Project Structure

```
/app
  /admin
  /login
  /auction
  /solve
  /leaderboard

/lib        → Database connection
/models     → MongoDB schemas
/api        → Backend routes
```

---

## ⏱️ Event Flow

1. Admin creates room
2. Teams join room
3. Auction phase (45 minutes)
4. Solving phase (1 hour)
5. Leaderboard display

---

## 🔮 Future Enhancements

* Real-time updates using WebSockets
* Better UI/UX
* Automated evaluation system
* Analytics dashboard

---

## 👨‍💻 Contributors

* Project Team (to be updated)

---

## 📜 License

This project is developed for educational purposes.

---

## 📢 Note

This README will be updated as development progresses.
