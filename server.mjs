import express from "express";
import fs from "fs";
import cors from "cors";

const overview = fs.readFileSync("DummyData/Overview.json");
const overviewData = JSON.parse(overview);

const users = fs.readFileSync("DummyData/Users.json");
const usersData = JSON.parse(users);

const app = express();
app.use(cors());
const PORT = 3000;

app.get("/api/dashboard/overview", (req, res) => {
  const { startDate, endDate, platform } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      error: "Please provide both startDate and endDate query parameters.",
    });
  }

  let filteredData = overviewData.timeSeriesData.filter((data) => {
    const currentDate = new Date(data.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return currentDate >= start && currentDate <= end;
  });

  if (platform && platform !== "All Platforms") {
    filteredData = filteredData.filter((data) => data.platform === platform);
  }

  const response = {
    ...overviewData,
    timeSeriesData: filteredData,
  };

  res.status(200).json(response);
});

app.get("/api/users", (req, res) => {
  const { startDate, endDate, page = 1, limit = 10 } = req.query;

  const filteredUsers = usersData.data.filter((user) => {
    const registerDate = new Date(user.registerDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return registerDate >= start && registerDate <= end;
  });

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  res.status(200).json({
    data: paginatedUsers,
    total: filteredUsers.length,
    page,
    lastPage: Math.ceil(filteredUsers.length / limit),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
