const mongoose = require("mongoose");
require('dotenv').config();



mongoose.connect(process.env.MONGODB_URI || "mongodb://admin-yogesh:"+process.env.PASSWORD+"@spark0-shard-00-00.jbkzy.mongodb.net:27017,spark0-shard-00-01.jbkzy.mongodb.net:27017,spark0-shard-00-02.jbkzy.mongodb.net:27017/todolistDB?ssl=true&replicaSet=atlas-10gjfe-shard-0&authSource=admin&retryWrites=true&w=majority",{ useNewUrlParser: true , useUnifiedTopology: true } );



// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true , useUnifiedTopology:true});



// Item Schema

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name : "Welcome to your toDoList!"
});

const item2 = new Item ({
  name : "Hit the + button to add the new item."
});

const item3 = new Item ({
  name : "<---Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];





// ...........................................................All Exports..............................................................

exports.defaultItems = defaultItems;

exports.itemsSchema = itemsSchema;

exports.Item = Item;

exports.getDate = ()=> {

    const today = new Date();
  
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long"
    };
  
    return today.toLocaleDateString("en-US", options);
  
};