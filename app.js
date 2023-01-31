const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-pulkit:ilTS13vm.@management-database.i36imhv.mongodb.net/toDoListDB",);

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item",itemSchema);

const item1 = new Item({
  name: "Wake Up"
});
const item2 = new Item({
  name: "Brush Teeth"
});
const item3 = new Item({
  name: "Have Breakfast"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

const today = date.getDate();

app.get("/", function(req, res) {
  Item.find({},function(err,itemsFound){
    if(itemsFound.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(!err){
          console.log("Successfully Added.");
        }
      });
    }
    res.render("list", {listTitle: today, newListItems: itemsFound});
  });

});

app.post("/customList", function(req,res){
  const newListName = req.body.newList;
  res.redirect("/"+newListName);
})

app.get("/:dynamicName", function(req,res){
  const customName = _.capitalize(req.params.dynamicName);

  List.findOne({name: customName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customName,
          items: []
        });
      
        list.save();
        res.redirect("/"+customName);
      }
      else{
        res.render("list", {listTitle: customName, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === today){
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === today){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
      console.log("Successfully deleted");
      res.redirect("/");
    }
  })
}
else{
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err, foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  })
}
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
