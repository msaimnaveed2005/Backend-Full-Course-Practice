//URL->https://localhost:8383
//IP->10.2.0.2:8383
const express=require('express');
const app=express();
const PORT=8383;
console.log('Server is running on port '+PORT);
app.listen(PORT,()=>console.log('Server is running on port '+PORT));