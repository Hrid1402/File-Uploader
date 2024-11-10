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
const multer  = require('multer')
const cloudinary = require('cloudinary').v2;
let streamifier = require('streamifier');

cloudinary.config({ 
  cloud_name: 'duuftbtwk', 
  api_key: '276182874385462', 
  api_secret: process.env.CLOUD
});

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

app.get("/", async(req, res) => {
  if(req.user){
    const userFolders = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        folders:{
          where:{
            parentID: null,
          },
          include: {
            children: true,
            files: true
          }
        }
      },
    });
    console.log(userFolders.folders[0].children);
    //TODO files[] temp
    res.render("index", {user: req.user, folders: userFolders.folders[0].children, path: null, files: userFolders.folders[0].files});
  }else{
    res.render("index", {user: req.user, folders: null, path: null, files: null});
  }
  
});

app.get("/sign-up", (req, res) => {res.render("sign-up");});
app.get("/log-in", (req, res) => {res.render("log-in");});


async function createMainUserFolder(name, id, res){
  await prisma.folder.create({
    data:{
      name: name,
      parentID: null,
      userID: id,
      createdAt: getFormattedDate()
    }
  });
  return res.redirect("/");
}
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
            createMainUserFolder(req.body.username, req.user.id, res);
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })



app.post("/upload/:id", upload.single('file'), async(req, res) => {
  console.log("File name:", req.file.originalname);
  console.log("File size:", req.file.size);
  console.log("File MIME type:", );
  console.log("File buffer:", req.file.buffer);
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "foo"
      },
      (error, result) => {
        if (error) reject(error);
        console.log(result);
        resolve(result.secure_url);
      }
    ); 
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  });
  console.log(result);
  
  parentID = req.params.id;
  if(req.params.id === undefined || req.params.id === "undefined"){
    console.log("Is undefined");
    const curUser = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        folders:{
          where:{
            parentID: null,
          }
        }
      }
    });
    parentID = curUser.folders[0].id;
  }

  await prisma.file.create({
    data:{
      name: req.file.originalname,
      url: result,
      folderID: parseInt(parentID),
      bytes: req.file.size,
      format: req.file.mimetype,
      createdAt: getFormattedDate()
    }
  });
  
  
  res.send("Uploaded successfully!");
  //res.redirect(req.get('referer'));
});

function getFormattedDate() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

app.post("/addFolder/:id?", async(req, res) => {
  console.log("curFolder: " + req.params.id);
  parentID = req.params.id;
  if(req.params.id === undefined || req.params.id === "undefined"){
    console.log("Is undefined");
    const curUser = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        folders:{
          where:{
            parentID: null,
          }
        }
      }
    });
    parentID = curUser.folders[0].id;
  }
  await prisma.folder.create({
    data:{
      name: req.body.name,
      parentID: parseInt(parentID),
      userID: req.user.id,
      createdAt: getFormattedDate()
    }
  });
  res.redirect(req.get('referer'));
});
app.get("/Files/:id", async(req,res)=>{
  const curUser = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    include: {
      folders: {
        where: {
          id: parseInt(req.params.id),
        },
        include: {
          children: true,
          files: true
        }
      },
      
    },
  });
  console.log(curUser.folders[0].files);
  res.render("index", {user: req.user, folders: curUser.folders[0].children, path: curUser.folders[0].name, files: curUser.folders[0].files});
});

app.post("/renameFolder/:id", async(req, res) => {
  await prisma.folder.update({
    where:{
      id: parseInt(req.params.id)
    },
    data:{
      name: req.body.name
    }
  });
  res.sendStatus(200);
});

app.post("/deleteFolder/:id", async(req, res) => {
  await prisma.folder.delete({
    where:{
      id: parseInt(req.params.id)
    }
  });
  res.sendStatus(200);
});


app.listen(PORT, () => console.log("http://localhost:" + PORT + "/"));