const express = require("express");
const cors = require("cors");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

/* ==========================
   MULTER SETUP
========================== */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ==========================
   HOME
========================== */

app.get("/", (req, res) => {
  res.send("Nexus Backend Running");
});

/* ==========================
   AUTH
========================== */

let users = [];

app.post("/api/register", (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = users.find(
    (u) => u.email === email
  );

  if (existingUser) {
    return res.status(400).json({
      message: "Email Already Exists",
    });
  }

  const user = {
    id: Date.now(),
    name,
    email,
    password,
    role,
  };

  users.push(user);

  res.json({
    message: "User Registered Successfully",
    user,
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) =>
      u.email === email &&
      u.password === password
  );

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
  const user = users.find(
    (u) => u.id == req.params.id
  );

  if (!user) {
    return res.status(404).json({
      message: "User Not Found",
    });
  }

  res.json(user);
});

/* ==========================
   INVESTORS
========================== */

app.get("/api/investors", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Ali Khan",
      investment: "$50000",
      city: "Islamabad",
    },
    {
      id: 2,
      name: "Ahmed Raza",
      investment: "$100000",
      city: "Lahore",
    },
  ]);
});

/* ==========================
   ENTREPRENEURS
========================== */

app.get("/api/entrepreneurs", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Hamza",
      startup: "Tech Startup",
    },
    {
      id: 2,
      name: "Usman",
      startup: "AI Solutions",
    },
  ]);
});

/* ==========================
   MESSAGES
========================== */

app.get("/api/messages", (req, res) => {
  res.json([
    {
      id: 1,
      sender: "Ali",
      message: "Hello Hamza",
    },
    {
      id: 2,
      sender: "Ahmed",
      message: "Interested in your startup",
    },
  ]);
});

/* ==========================
   DOCUMENTS
========================== */

let documents = [];

app.get("/api/documents", (req, res) => {
  res.json(documents);
});

app.post(
  "/api/document-upload",
  upload.single("document"),
  (req, res) => {
    const document = {
      id: Date.now(),
      name: req.file.originalname,
      path: req.file.path,
      status: "Uploaded",
      uploadedAt: new Date(),
    };

    documents.push(document);

    res.json({
      message: "Document Uploaded Successfully",
      document,
    });
  }
);

app.get("/api/document-status/:id", (req, res) => {
  const document = documents.find(
    (d) => d.id == req.params.id
  );

  if (!document) {
    return res.status(404).json({
      message: "Document Not Found",
    });
  }

  res.json({
    documentId: document.id,
    status: document.status,
  });
});

/* ==========================
   MEETINGS
========================== */

let meetings = [];

app.post("/api/meetings", (req, res) => {
  const {
    title,
    date,
    startTime,
    endTime,
    participant,
  } = req.body;

  const conflict = meetings.find(
    (m) =>
      m.date === date &&
      m.startTime === startTime &&
      m.participant === participant
  );

  if (conflict) {
    return res.status(400).json({
      message: "Time Slot Already Booked",
    });
  }

  const meeting = {
    id: Date.now(),
    title,
    date,
    startTime,
    endTime,
    participant,
    status: "Pending",
  };

  meetings.push(meeting);

  res.json({
    message: "Meeting Scheduled",
    meeting,
  });
});

app.get("/api/meetings", (req, res) => {
  res.json(meetings);
});

app.put(
  "/api/meetings/:id/accept",
  (req, res) => {
    const meeting = meetings.find(
      (m) => m.id == req.params.id
    );

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting Not Found",
      });
    }

    meeting.status = "Accepted";

    res.json(meeting);
  }
);

app.put(
  "/api/meetings/:id/reject",
  (req, res) => {
    const meeting = meetings.find(
      (m) => m.id == req.params.id
    );

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting Not Found",
      });
    }

    meeting.status = "Rejected";

    res.json(meeting);
  }
);

/* ==========================
   VIDEO CALL API
========================== */

app.get("/api/video-call/:id", (req, res) => {
  res.json({
    meetingId: req.params.id,
    roomLink:
      "https://meet.google.com/demo-" +
      req.params.id,
    status: "Ready",
  });
});

/* ==========================
   SOCKET.IO
========================== */

io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log("Joined Room:", roomId);
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    console.log("Left Room:", roomId);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

/* ==========================
   SERVER
========================== */

server.listen(5000, () => {
  console.log(
    "Nexus Backend Running On Port 5000"
  );
});