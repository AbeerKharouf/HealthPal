<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD

=======
>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956
>>>>>>> 34aa69fdec16658fa3a0cc759b5848c1aad343c8
>>>>>>> 7eccac56bc1cdfb156c3fc502fcedfef9f2ae9fa
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const userRoutes = require("./routes/user");

<<<<<<< HEAD
=======
<<<<<<< HEAD

=======
<<<<<<< HEAD

=======
>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956
>>>>>>> 34aa69fdec16658fa3a0cc759b5848c1aad343c8
>>>>>>> 7eccac56bc1cdfb156c3fc502fcedfef9f2ae9fa
const app = express();

app.use(cors());
app.use(express.json());

// اختبار الاتصال
app.get("/", (req, res) => {
  res.send("HealthPal API is running...");
<<<<<<< HEAD
});
=======
<<<<<<< HEAD
}); 
=======
<<<<<<< HEAD
}); 
=======
});
>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956
>>>>>>> 34aa69fdec16658fa3a0cc759b5848c1aad343c8
>>>>>>> 7eccac56bc1cdfb156c3fc502fcedfef9f2ae9fa

// مثال: جلب كل المستخدمين
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

<<<<<<< HEAD
// مسارات المستخدم
=======
<<<<<<< HEAD
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
=======
<<<<<<< HEAD
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
=======
const userRoutes = require("./routes/user");
>>>>>>> 7eccac56bc1cdfb156c3fc502fcedfef9f2ae9fa
app.use("/api", userRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
<<<<<<< HEAD
=======
>>>>>>> 8eb49fecd0da64acfa60304a4e665f9a1377c956
>>>>>>> 34aa69fdec16658fa3a0cc759b5848c1aad343c8
>>>>>>> 7eccac56bc1cdfb156c3fc502fcedfef9f2ae9fa
