require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "Our Little Secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(
  passport.session({
    name: "Manmohan",
  })
);

mongoose.connect("mongodb://0.0.0.0:/ecommerceDB");

const loginSchema = new mongoose.Schema({
  userFname: String,
  username: String,
  password: String,
});

loginSchema.plugin(passportLocalMongoose);
loginSchema.plugin(findOrCreate);

const loginDetail = mongoose.model("loginDetail", loginSchema);

passport.use(loginDetail.createStrategy());

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, {
      id: user.id,
      username: user.username,
      userFname: user.userFname,
    });
  });

  console.log(user.userFname);
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

app.get("/", (req, res) => {
  // if (req.isAuthenticated()) {
  //   res.render("home");
  // } else {
  //   res.redirect("/register");
  // }

  loginDetail.find(req.user, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (req.isAuthenticated(req.user)) {
        res.render("home", {
          usersWithSecrets: user,
        });
        console.log(req.session);
      } else {
        res.redirect("/register");
      }
    }
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

// app.get("/logout", (req, res) => {
//   req.logout(function (err) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.redirect("/");
//     }
//   });
// });

app.post("/register", (req, res) => {
  const userEmail = req.body.reg_email;
  const userPassword = req.body.reg_password;
  const ReguserName = req.body.reg_name;

  loginDetail.register(
    {
      username: userEmail,
      userFname: ReguserName,
    },
    userPassword,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/");
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const userLoginEmail = req.body.username;
  const userLoginPassword = req.body.password;

  const user = new loginDetail({
    username: userLoginEmail,
    password: userLoginPassword,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/");
      });
    }
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
