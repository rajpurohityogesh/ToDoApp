const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");   
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const database = require("./database.js");
require("dotenv").config();

const { delay } = require("lodash");

var currentUserName="";


const app = express();


global.err="";

let port = process.env.PORT;
if(port==null || port =="") {
    port =3000;
}



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret: "OurLittleSecret",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session({secret:"thisIsASecret"}));


mongoose.set("useCreateIndex",true);


// Our User Schema

const userSchema = new mongoose.Schema({
    username: String,
    passward: String,
    lists: [ database.itemsSchema ]
});


// Adding plugins to schema

userSchema.plugin(passportLocalMongoose);


// Create model from User Schema

const User= new mongoose.model("users",userSchema);


//Create Strategy abd serialize and Deserialize

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ......................................GET requests.....................................


app.get("/",(req,res)=>{
    res.render("home");
})




app.get("/list", function(req, res) {

    if(req.isAuthenticated()) {

        User.findOne({username:currentUserName}, 'lists' ,(err,rs)=>{
            
            var date = database.getDate();
            res.render("list", {listTitle: date, newListItems: rs.lists});

        });
    }
    else {
        res.redirect("/login");
    }

});


app.get("/login",(req,res)=>{
    res.render("login", {errMsg: err});
});


app.get("/register",(req,res)=>{
    res.render("register", {errMsg: err});
})



// ......................................POST requests.....................................



app.post("/register",(req,res)=>{

    if(req.body.username=="" || req.body.password=="") {
        err="*Please Fill Username and Password*";
        res.redirect("/register");
    }
    else {
        User.findOne({username:req.body.username},(err,user)=>{
            if(user!==null) {
                console.log("jhdshdghfdshgsd");
                err="*User already exist with this main Id you should login*";
                res.redirect("/register");
            } 
            else {
                User.register({username:req.body.username},req.body.password,(err,user)=>{
                    if(err) {
                        err="*There is some system error please try again after some time*";
                        res.redirect("/register");
                    }
                    else {
                        passport.authenticate("local")(req,res,()=>{
                            User.updateOne(
                                { username : req.body.username }, 
                                { $push: { lists: database.defaultItems } },
                                (err)=>{}
                            );
                            
                            res.redirect("/login");  
                        });
                    }
                });
            }
        });
    }

});


app.post("/login",(req,res)=>{

    if(req.body.username=="" || req.body.password=="") {
        err="*Please Fill Username and Password*";
        res.redirect("/login");
    }
    else {
        User.findOne({username:req.body.username},(err,result)=>{
            if(result) {
                const user = new User ({
                    username: req.body.username,
                    passport: req.body.password
                });
            
                req.logIn(user,(err)=>{
                    if(err) {
                        err="*There is some system error please try again after some time*";
                        res.redirect("/login");
                    }
                    else {
                        passport.authenticate("local")(req,res,()=>{
                            currentUserName = req.body.username;
                            res.redirect("/list");
                        });
                    }
                });
            }
            else {
                err="*Incorrect mail Id*";
                res.redirect("/login");
            }
        });
    }

})



app.post("/list", (req, res)=>{

    const itemName = req.body.newItem;
  
    const addItem = new database.Item({
      name : itemName
    });

    User.updateOne(
        { username : currentUserName }, 
        { $push: { lists: addItem } },
        (err)=>{}
    );

    res.redirect("/list");

});



  
app.post("/delete",(req,res)=>{
    const checkedItemId = req.body.checkBox;

    User.updateOne(
        { username : currentUserName }, 
        { $pull: { lists: {_id:checkedItemId} } },
        (err)=>{
            res.redirect("/list");
        }
    ); 
  
});
 






  
app.listen(port, function() {
    console.log("Server started on port"+port);
});
  