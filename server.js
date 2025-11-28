<<<<<<< HEAD

=======
>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

<<<<<<< HEAD

=======
>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956
const app = express();

app.use(cors());
app.use(express.json());

// اختبار الاتصال
app.get("/", (req, res) => {
  res.send("HealthPal API is running...");
<<<<<<< HEAD
}); 
=======
});
>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956

// مثال: جلب كل المستخدمين
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

<<<<<<< HEAD
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
=======
const userRoutes = require("./routes/user");
app.use("/api", userRoutes);


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956
