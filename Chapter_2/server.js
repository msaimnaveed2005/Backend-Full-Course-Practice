//URL->http://localhost:8383
//IP->127.0.0.1:8383
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
   res.send('<h1>Homepage</h1>')
})

app.get('/dashboard', (req,res)=>{
    res.send('<h1>Dashboard</h1>')
})

// Type 2 - API Endpoints (non-visual data)


app.get('/api/data', (req,res)=>{
    console.log('This one was for data')
    res.send(data)
})

console.log('Server is running on port '+PORT);
app.listen(PORT,()=>console.log('Server is running on port '+PORT));