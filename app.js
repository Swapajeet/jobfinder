if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const axios = require("axios");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");

const multer = require("multer");


// const { storage } =
// require("./cloudinary");

// const upload = multer({
//   storage
// });

const session =
require("express-session");
const MongoStore = require("connect-mongo").default;
const passport =
require("passport");

const LocalStrategy =
require("passport-local").Strategy;

const User =require("./models/user");

const LikedJob =require("./models/job");

const app = express();



// =======================
// DATABASE
// =======================
const db_url = process.env.ATLAS_URI;

 main()
 .then(()=>{
        console.log("mongodb is connected");    
 })
 .catch((err)=>{
        console.log(err);``
 });
 async function main(){
    await mongoose.connect(db_url);
 }


// =======================
// VIEW ENGINE
// =======================

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set(
  "views",
  path.join(__dirname, "views")
);



// =======================
// MIDDLEWARE
// =======================

app.use(express.urlencoded({
  extended: true
}));

app.use(express.static("public"));



// =======================
// SESSION
// =======================

const store = MongoStore.create({
  mongoUrl: db_url,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("SESSION STORE ERROR");
});

const sessionOption = {
       store,
       secret: process.env.SESSION_SECRET,
       saveUninitialized: true,
       cookie:{
              expires:Date.now()+7*24*60*60*1000,
              maxAge:7*24*60*60*1000,
              httpOnly:true,
       },
   };
  app.use(session(sessionOption));


// =======================
// PASSPORT
// =======================

app.use(passport.initialize());

app.use(passport.session());

passport.use(
  new LocalStrategy(
    User.authenticate()
  )
);

passport.serializeUser(
  User.serializeUser()
);

passport.deserializeUser(
  User.deserializeUser()
);



// =======================
// AUTH MIDDLEWARE
// =======================

function isLoggedIn(
  req,
  res,
  next
) {

  if (req.isAuthenticated()) {

    return next();

  }

  res.redirect("/login");

}



// =======================
// REGISTER
// =======================

app.get("/register", (req, res) => {

  res.render("register");

});



app.post("/signup", async (req, res) => {

  try {

    const {
      username,
      email,
      password
    } = req.body;

    const newUser =
    new User({

      username,
      email

    });

    await User.register(
      newUser,
      password
    );

    res.redirect("/login");

  }

  catch (err) {

    console.log(err);

    res.send(err.message);

  }

});



// =======================
// LOGIN
// =======================

app.get("/login", (req, res) => {

  res.render("login");

});



app.post(

  "/login",

  passport.authenticate("local", {

    successRedirect: "/",

    failureRedirect: "/login"

  })

);



// =======================
// LOGOUT
// =======================

app.get("/logout", (req, res) => {

  req.logout(() => {

    res.redirect("/login");

  });

});



// =======================
// HOME PAGE
// =======================

app.get("/", isLoggedIn, async (req, res) => {

  try {

    const q =
    req.query.q || "";

    const response =
    await axios.get(

      "https://arbeitnow.com/api/job-board-api"

    );

    const jobs =
    response.data.data || [];

    let filteredJobs =
    jobs;

    // SEARCH
    if (q.trim() !== "") {

      filteredJobs =
      jobs.filter(job =>

        job.title
        ?.toLowerCase()
        .includes(
          q.toLowerCase()
        )

        ||

        job.company_name
        ?.toLowerCase()
        .includes(
          q.toLowerCase()
        )

        ||

        job.location
        ?.toLowerCase()
        .includes(
          q.toLowerCase()
        )

      );

    }

    res.render("index", {

      jobs: filteredJobs,

      user: req.user

    });

  }

  catch (err) {

    console.log(err);

    res.render("index", {

      jobs: [],

      user: req.user

    });

  }

});



// =======================
// LIKE JOB
// =======================

app.post(
  "/toggle-like",
  isLoggedIn,

  async (req, res) => {

    try {

      const job =
      new LikedJob(req.body);

      await job.save();

      res.redirect("/");

    }

    catch (err) {

      console.log(err);

    }

  }

);



// =======================
// PROFILE EDIT
// =======================

app.get(
  "/profile/edit",

  isLoggedIn,

  (req, res) => {

    res.render(
      "profile-edit",

      {
        user: req.user
      }

    );

  }

);



// =======================
// PROFILE UPDATE
// =======================

app.post(
  "/profile/edit",

  isLoggedIn,

  async (req, res) => {

    try {

      const {

        profile,

        skills,

        degree,

        college,

        year,
        resume

      } = req.body;

      await User.findByIdAndUpdate(

        req.user._id,

        {

          profile,

          skills,

          education: {

            degree,

            college,

            year

          },
          resume

        }

      );

      res.redirect("/");

    }

    catch (err) {

      console.log(err);

    }

  }

);



// =======================
// RESUME PAGE
// =======================

app.get(

  "/resume/upload",

  isLoggedIn,

  (req, res) => {

    res.render("resume");

  }

);


// =======================
// SERVER
// =======================

app.listen(3000, () => {

  console.log(
    "Server running on port 3000"
  );

});