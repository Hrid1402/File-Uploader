const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express();
const path = require("node:path");
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient, Prisma } = require('@prisma/client');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
require('dotenv').config();
const prisma = new PrismaClient();
const PORT = 3000
app.use(
    expressSession({
      cookie: {
       maxAge: 7 * 24 * 60 * 60 * 1000 // ms
      },
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      store: new PrismaSessionStore(
        new PrismaClient(),
        {
          checkPeriod: 2 * 60 * 1000,  //ms
          dbRecordIdIsSessionId: true,
          dbRecordIdFunction: undefined,
        }
      )
    })
  );
  
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

const validateSignUp = [
  body("username")
    .notEmpty().withMessage("Username is required.")
    .isLength({ min: 1, max: 15 })
    .withMessage("The username must have between 1 to 15 characters."),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must have at least 8 characters."),
  
  body("confirmPassword")
    .notEmpty().withMessage("Please confirm your password.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    })
];

passport.use(
  new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },async (username, password, done) => {
    try {
      console.log("tried");
      const user = await prisma.user.findFirst({
        where:{
          username: username
        }
      })
      console.log("user: " + user);
      if (!user) {
        console.log("Incorrect username");
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log("Incorrect password");
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where:{
        id: id
      }
    });
    done(null, user);
  } catch(err) {
    done(err);
  }
});

app.get("/", (req, res) => {
    res.render("index", {user: req.user});
});

app.get("/sign-up", (req, res) => {res.render("sign-up");});
app.get("/log-in", (req, res) => {res.render("log-in");});
app.post("/sign-up", validateSignUp, async(req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.render("errors");
    }
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      try {
          const user = await prisma.user.create({
            data:{
              username: req.body.username,
              password: hashedPassword
            }
          });
          console.log(user);
          req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect("/");
        });
      } catch(err) {
        return next(err);
      }
    });
});
app.post("/log-in", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in"
}));
app.post("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect("/");
  });
});





app.listen(PORT, () => console.log("http://localhost:" + PORT + "/"));