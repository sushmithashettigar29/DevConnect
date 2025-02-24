const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const fileFilter = (req,file,cb) =>{
    if(file.mimetype === "application/pdf" || file.mimetype.includes("officedocument")){
        cb(null,true);
    }else{
        cb(new Error("Only PDF and DOCS files are allowed"), false);
    }
}

const upload = multer({ storage, fileFilter });

module.exports = upload;
