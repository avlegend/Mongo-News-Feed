// *** DEPENDENCIES ***
const mongoose = require("mongoose");
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./models");

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Make public a static folder
app.use(express.static("public"));

// ADD ROUTES HERE
app.get("/", (req, res) => {
  db.Article
  .find({})
  .populate("comments")
  .then(dbArticles =>{
   // res.json(dbArticles)
    res.render("home", {articles: dbArticles});
  })
});

app.get("/scrape", (req, res) => {
  axios
    .get("https://www.ign.com/")
    .then(response => {
      //console.log(response.data);
      const $ = cheerio.load(response.data);
      var array = [];
      $("article.feed-item").each(function (i, element) {
        const title = $(element).find(".item-title-link").text().trim()
        const link = $(element).find(".item-title-link").attr("href")
        array.push({
          title: title,
          link: link
        })
      });
      //console.log(array)
   //res.send(array);
      db.Article.deleteMany({}).then(responseOne=>{
        db.Article.insertMany(array)
      .then(responseTwo => {
        console.log(responseTwo);
        res.redirect('/');
      }).catch(err => console.log(err) )
      }).catch(err => console.log(err) )
      
    });
    //res.send("scraped data from ign")
});

app.post("/api/comment/:articleId", (req, res) => {
  db.Comment
  .create({body: req.body.body, user: req.body.user})
  .then(dbComment => {
    //res.json(dbComment)
    return db.Article.findOneAndUpdate({_id: req.params.articleId}, {$push: { comments: dbComment._id}}, {new: true})
  })
  .then(() => res.redirect("/"))
  .catch(err => res.json(err));
});

app.delete("/api/comment/:commentId", (req, res) => {
  db.Comment
  .deleteOne({id:req.body.id})
  .then((response) => {
    //res.redirect("/")
    res.json(response);
  })
  .catch(err => res.json(err));
});

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraperData", { useNewUrlParser: true});



// Listen on port 3000
app.listen(PORT, () => { console.log(`App running on port http://localhost:${PORT}`) });