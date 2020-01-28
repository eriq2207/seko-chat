const express = require('express')
const app = express()
const path = require('path')

app.get('/', (req,res )=> {
    res.sendFile(path.join(__dirname,'/chat.html'))
})
app.listen(80,()=> console.log("Serwer uruchomiony na porcie 80"))