const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const {v4:uuidv4} = require('uuid')
const path = require('path')
const cors = require('cors')

const port = 3000


dbPath = path.join(__dirname , 'data.db')

const app = express()
app.use(express.json())
app.use(cors())

let db = null

const initialingServer = async ()=>{
    try{
         db = await open(
            {
                filename:dbPath,
                driver:sqlite3.Database,
            }
        )
        app.listen(port,()=>{
            console.log(`Server Start at ${port} port`)
        })
    }catch(e){
        console.log(`error is : ${e.message}`)
        process.exit(1)
    }
}

initialingServer()

app.post('/login',async (req,res)=>{
    const {name,address} = req.body

    try {
        const user = await db.get('SELECT * FROM users WHERE name = ?' , [name])
        if(!user){
            const id = uuidv4()
            await db.run('INSERT INTO users (id,name) VALUES (?,?)',[id, name])
            await db.run('INSERT INTO address (user_id,address) VALUES (?,?)', [id,name])
            return res.send({ok:true , message:'successfully new user added and address saved'})
        }else{
            await db.run('INSERT INTO address (user_id,address) VALUES (?,?)' ,[user.id,address])
            return res.send({ok:true, message:'successfully address added to existing user'})
        }
    } catch (error) {
        console.log(`error is : ${error.message}`)
        return res.json({ok:false,message:error.message})
    }
})