const multer=require("multer");
const  {v4:uuidv4}= require("uuid");
const path=require("path");
const storage=multer.diskStorage({
    destination: (req, file, cb) => {
    const newLocal = "./public/images/uploads";
    cb(null, newLocal);
  },
    filename:function (req,file,cb){
      const uniqueName= uuidv4();
      cb(null,uniqueName+path.extname(file.originalname));
    }
  });


  const upload=multer({storage:storage});
  module.exports=upload

