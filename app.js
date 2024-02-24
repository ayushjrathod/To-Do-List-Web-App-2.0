const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//Mongoose Connection

mongoose.connect("mongodb+srv://clashofa1057:temppass@cluster0.fqzvj3u.mongodb.net/todoList?retryWrites=true&w=majority")
.then(function(){
    console.log("Connection to mongodb server successful");
})
.catch(function(err){
  console.log(err);
});

//MongoDB Part

const itemsSchema = new mongoose.Schema({
  Title: String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  Title: "hey you, keep going"
});

const item2 = new Item({
  Title:"Hey nice job coming till here"
});

const defaultItems = [item1,item2];

const listSchema = new mongoose.Schema({
  name:String,
  items: [itemsSchema]
});

const List = mongoose.model("List",listSchema);



//Request Handling 

// app.get("/", async function(req, res){
//   try {
//     const foundItems = await Item.find({});

//     if (foundItems.length === 0) {
//       await Item.insertMany(defaultItems);
//       console.log("Insertion success");
//       res.redirect("/");
//     } else {
//       res.render("list", {listTitle: "Today", newListItems: foundItems});
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });


app.get("/",(req, res)=>{
 
    Item.find({})
      .then((foundItems)=>{
        if (foundItems.length === 0) {
          Item.insertMany(defaultItems)
          
          console.log("Insertion success");
          res.redirect("/");
        } else {
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
      })
      .catch((err)=>{
        console.error(err);
        res.send("Internal Server Error");
      });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    Title:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName})
      .then((foundList)=>{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err)=>{
        console.log(err);
      });
  }
});

app.post("/delete",(req,res)=>{
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName  === "Today"){
    Item.findByIdAndDelete(checkedItemID)
    .then(()=>{res.redirect("/")})
    .catch((err)=>{console.log(err)});
  }else{
     List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemID}}})
      .then((foundList)=>{
        res.redirect("/" + listName)
      })
      .catch((err)=>{
        console.log(err);
      });
  }
});


app.get("/:customListName",(req,res)=>{
  const customListName = req.params.customListName;

  List.findOne({name: customListName})
    .then((foundLists)=>{
      if(!foundLists){
        const newList = new List({
          name: customListName,
          items: defaultItems
        });
        newList.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle: foundLists.name, newListItems: foundLists.items})
      }
    })
    .catch((err)=>{
      console.log("List creation Error "+ err);
    });
});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
