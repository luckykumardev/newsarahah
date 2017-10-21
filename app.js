var express                = require("express");
var app                    = express();
var bodyParser             = require("body-parser");
var mongoose               = require("mongoose");
var passport               = require("passport");
var localStrategy          = require("passport-local"); 
var passportLocalMongoose  = require("passport-local-mongoose");
var User                   = require("./models/user");



mongoose.connect("mongodb://localhost/varahah_vv2");
var app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
  
  secret: "lucky is smart",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
    
    res.locals.currentUser = req.user.username;
    next();
});


//SCHEMA SETUP

var messageSchema = new mongoose.Schema({
    
    username: String,
    message: String
});


var Message = mongoose.model("Message", messageSchema);

Message.create(
{

username: "lucky321111",
message: "tunae mera dill todh dea aaj simran"

}, function(err, message){
   
   if(err){
   	console.log(err);

   } else {
   	console.log("new message is created:");
   	console.log(message);
   }


});


//=============
//ROUTES
//=============


app.get("/",function(req, res)
{
	res.render("landing");
});


app.get("/Myprofile/", isLoggedIn, function(req, res)
	{
		//Get all messages from DB
     Message.find({}, function(err, Allmessages){
        if(err){
        	console.log(err);
        } else {
           
           	res.render("messages",{Messages: Allmessages, currentUser: req.user});
	
       
         }
       
       });
		
		

	});
app.post("/Myprofile/", function(req,res){
	//res.send("You hit the Post Route!!!");
	//get data from form and add to campgrounds array
	 var username = req.body.username;
	 var message = req.body.message;

	 var newMessages = {username: username, message: message};

     Message.create(newMessages, function(err, newlyCreated){
   
   if(err)
   {
   	console.log(err);

   }
   else
 {
       //redirect back to Myprofile page
     	res.redirect("/Myprofile");

 }

   });

});


app.get("/Myprofile/new", function(req,res){

 res.render("new.ejs");
   
});




//Authentication routes

//show sign up form
app.get("/register", function(req, res){
  res.render("register");
});

//handling user sign up

app.post("/register", function(req, res){
     req.body.username
     req.body.password
     User.register(new User({username: req.body.username}), req.body.password, function(err, user){
      if(err){
        console.log(err);
        return res.render("register");
      }
      passport.authenticate("local")(req, res, function(){
           
           res.redirect("/Myprofile");

        });

     });
       
});


//Login Routes
//render login form
app.get("/login", function(req, res){
   
   res.render("login");

});


app.post("/login", passport.authenticate("local", {

    successRedirect: "/Myprofile/",
    failureRedirect: "/login"

}) ,function(req, res){

});


//logout route
app.get("/logout", function(req, res){
   
   req.logout();
   res.redirect("/");
 
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
          return next();
    }
    res.redirect("/login");
}




app.listen(3000,function()
	{
		console.log("The varahah server has started");

	});
