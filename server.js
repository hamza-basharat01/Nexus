const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Nexus Backend Running");
});
let users = [];

app.post("/api/register", (req, res) => {
  const { name, email, password, role } = req.body;

  const user = {
    id: Date.now(),
    name,
    email,
    password,
    role,
  };

  users.push(user);

  res.json({
    message: "User Registered",
    user,
  });
});
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      message: "Invalid Credentials",
    });
  }

  res.json({
    message: "Login Successful",
    user,
  });
});
app.get("/api/profile/:id", (req, res) => {
  const user = users.find((u) => u.id == req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User Not Found",
    });
  }

  res.json(user);
});
app.get("/api/investors", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Ali Khan",
      investment: "$50,000",
    },
  ]);
});

app.get("/api/entrepreneurs", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Hamza",
      startup: "Tech Startup",
    },
  ]);
});

app.get("/api/messages", (req, res) => {
  res.json([
    {
      sender: "Ali",
      message: "Hello",
    },
  ]);
});

app.get("/api/documents", (req, res) => {
  res.json([
    {
      name: "Business Plan.pdf",
    },
  ]);
});

app.listen(5000, () => {
  console.log("Server Running On Port 5000");
});
