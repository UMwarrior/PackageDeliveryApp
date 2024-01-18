const express = require("express");
const bodyParser = require("body-parser");

const userRouter = require("./router/userRouter");
const driverRouter = require("./router/driverRouter");
const adminRouter = require("./router/adminRouter");

const app = express();

const PORT = process.env.port || 3000;

app.use(bodyParser.json());

app.use("/user" , userRouter);
app.use("/driver" , driverRouter);
app.use("/admin" , adminRouter);

app.listen(PORT , ()=>{
    console.log("Server is running on PORT :- " , PORT);
})


