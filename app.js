const express = require("express");
const app = express();
const path = require("node:path");

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

PORT = 3000

app.get("/", (req, res) => {

    res.render("index");
});

app.get("/sign-up", (req, res) => {

    res.render("sign-up");
});







app.listen(PORT, () => console.log("http://localhost:" + PORT + "/"));