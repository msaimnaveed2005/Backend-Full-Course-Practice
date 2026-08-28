//URL->http://localhost:8383
//IP->138.199.21.208:8383
const express=require('express');
const app=express();
const PORT=8383;

// HTTP VERBS && Routes (or paths)
let data = {
    name:'james',
}

//Type 1 - Website - Endpoints
// The method informs the nature of request and the route is the further subdirectory (basically we direct yhe 
app.get('/', (req,res)=>{
  //This is endpoint number 1 - /
  console.log('Yay I hit an endpoint',req.method)
  res.sendStatus(201)
})

app.get('/dashboard', (req,res)=>{
    console.log('Yay I hit an endpoint /dashboard',req.method)
    res.send('hi')
})

// Type 2 - API - Endpoints
app.get('/api/data', (req,res)=>{
    console.log('Yay I hit an endpoint /api/data',req.method)
    res.send(data)
})

console.log('Server is running on port '+PORT);
app.listen(PORT,()=>console.log('Server is running on port '+PORT));