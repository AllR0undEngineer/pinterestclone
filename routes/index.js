var express = require('express');
var router = express.Router();
const userModel=require("./users");
const postModel=require("./posts");
const localStrategy=require("passport-local");
const passport = require('passport');
passport.use(new localStrategy(userModel.authenticate()));
const upload=require("./multer");
router.get('/', function(req, res, next) {
  res.render('index', { nav:false });
});
// router.get("/register",function(req,res){
//    res.render("register",{nav:false});
// })
router.get("/profile",isLoggedIn,async function(req,res){
  const user= await 
  userModel
  .findOne({username:req.session.passport.user})
  .populate("posts");
  res.render("profile",{user,nav:true})
});
router.get("/show/posts",isLoggedIn,async function(req,res){
  const user= await userModel.findOne({username:req.session.passport.user})
  .populate("posts");
  res.render("show",{user,nav:true});
});

router.get("/feed",isLoggedIn,async function(req,res){
  const user= await userModel.findOne({username:req.session.passport.user})
  const posts=await postModel.find()
  .populate("user");
  res.render("feed",{user,posts,nav:true});
});

router.post("/fileupload",isLoggedIn, upload.single("image"), async function(req,res){
   const user=await userModel.findOne({username:req.session.passport.user});
    user.profileImage=req.file.filename;
    await user.save();
    res.redirect("/profile");
});

router.get("/add", function(req,res){
   res.render("add",{nav:true})
});

router.post("/createpost",isLoggedIn, upload.single("postimage"), async function(req,res){
  const user=await userModel.findOne({username:req.session.passport.user});
   const post=await postModel.create({
     title:req.body.title,
     description:req.body.description,
     image:req.file.filename,
     user:user._id
   });
   user.posts.push(post._id);
   await user.save();
   res.redirect("/profile");
});
router.post("/register",function(req,res,next){
  let userData=new userModel({
    name:req.body.name,
    username:req.body.username,
    email:req.body.email
  }) ;
  userModel.register(userData,req.body.password)
  .then (function(){
     passport.authenticate("local")(req,res,function(){
      res.redirect('/profile');
     });
   });
});
router.post('/login',passport.authenticate("local",{
successRedirect:"/profile",
failureRedirect:"/"
}),
function(req,res){
});

router.get("/logout", function(req,res,next){
   req.logout(function(err){
    if(err){
      return next(err)
    }
    res.redirect("/")
   });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    next();
  }
  else{
    res.redirect("/");
    return;
  }
}

module.exports = router;
