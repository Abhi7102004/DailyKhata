const fs = require("fs");
const express = require("express");
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  fs.readdir("files", "utf-8", (err, files) => {
    if (err) {
      res.send("Something went wrong");
      return;
    }
    res.render("index", { files });
  });
});

app.get("/edit/:fileName", (req, res) => {
  fs.readFile(`./files/${req.params.fileName}`, "utf-8", (err, data) => {
    if (err) {
      res.send("Something went wrong");
      return;
    }
    const fileName = req.params.fileName;
    const fileNameWithoutExtension = fileName.slice(
      0,
      fileName.lastIndexOf(".")
    );
    res.render("edit", { data, fileName, fileNameWithoutExtension });
  });
});

app.post("/update/:fileName", (req, res) => {
  fs.writeFile(`./files/${req.params.fileName}`, req.body.khataData, (err) => {
    if (err) {
      res.send("Something went wrong");
      return;
    }
    res.redirect("/");
  });
});

app.get("/delete/:fileName", (req, res) => {
  fs.unlink(`./files/${req.params.fileName}`, (err) => {
    if (err) {
      res.send("Something went wrong");
      return;
    }
    res.redirect("/");
  });
});

app.get("/create", (req, res) => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const baseFileName = `${day}-${month}-${year}`;
  let fileName = `${baseFileName}.txt`;

  if (fs.existsSync(`./files/${fileName}`)) {
    res.redirect("/");
  } else {
    fs.writeFile(`./files/${fileName}`, "", (err) => {
      if (err) {
        res.send("Something went wrong");
        return;
      }
      res.render("create", { fileName });
    });
  }
});
app.post("/create/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = `./files/${fileName}`;
  const khataData = req.body.khataData;
  fs.writeFile(filePath, khataData, (err) => {
    if (err) {
      res.send("Something went wrong");
      return;
    }
    res.redirect("/");
  });
});

app.get("/show/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = `./files/${fileName}`;
  const fileNameWithoutExtension = fileName.slice(0, fileName.lastIndexOf("."));
  
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      res.send("File not found");
      return;
    }
    const lines = data.split('\n');
    const rows = [];
    lines.forEach(line => {
      const parts = line.trim().split(/[-\s]+/);
      if (parts.length === 2) {
        const [item, price] = parts;
        rows.push({ item, price });
      }
    });
    res.render("show", { fileNameWithoutExtension, rows });
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
