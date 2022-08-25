const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const date=require(__dirname+'/date.js');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://adminAryan:admin@cluster0.rznq5bg.mongodb.net/todolistDB");
mongoose.connect("mongodb://localhost:27017/peopleDB");


const itemSchema={
  name:String
};
const Item=mongoose.model('Item',itemSchema);

const item1=new Item({
  name:"Welcome to your ToDo List"
});
const item2=new Item({
  name:"Hit + item to add new item"
});
const item3=new Item({
  name:"<-- Hit this button to delete an item"
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  let day=date.getDate();
  Item.find({},function(err,fItems){
    if(fItems.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Success");
        }
      })
      res.redirect('/');
    }
    else{
      res.render("list", 
      {listTitle: "Today", 
      current:day,
      newListItems: fItems});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName=="Today"){    
    item.save();
    res.redirect('/');
  }
  else{
    List.findOne({name:listName},function(err,found){
      if(!found){
        console.log("List not Found");
      }
      else{
        found.items.push(item);
        found.save();
        res.redirect('/'+listName);
      }
    });
  }
});

app.post("/delete",function(req,res){
  const itemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(itemId,function(err){
      if(!err){
        console.log("Successfully deleted");
        res.redirect('/');
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id:itemId}}}, function(err,foundList){
      if(!err){
          console.log(listName);
          res.redirect('/'+listName);
        }
      }
    );
  }
});

app.get("/:go", function(req,res){
  const custom=_.capitalize(req.params.go);
  let day=date.getDate();
  if(custom==="About"){
    res.render("about");
  }
  else{
    List.findOne({name:custom},function(err,found){
      if(!err){
        if(!found){
          const list=new List({
            name:custom,
            items:defaultItems
          });
          list.save();
          res.redirect('/'+custom);
        }
        else{
          res.render('list',{
            listTitle:found.name,
            current:day,
            newListItems:found.items
          });
        }
      }
    })
  }
});

port=process.env.PORT;
if(port==null||port==''){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port sucessfully");
});
