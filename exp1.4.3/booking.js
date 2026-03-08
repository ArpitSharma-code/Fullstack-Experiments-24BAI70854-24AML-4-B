const express = require("express")
const { createClient } = require("redis")
const { v4: uuidv4 } = require("uuid")

const app = express()
app.use(express.json())

const redis = createClient({
  url: process.env.REDIS_URL
})

redis.on("error", (err) => console.log("Redis Error:", err))

async function startServer() {

  await redis.connect()
  console.log("Redis Connected")

  const TOTAL_SEATS = 100

  const exists = await redis.exists("available_seats")
  if (!exists) {
    await redis.set("available_seats", TOTAL_SEATS)
    console.log("Seats initialized")
  }

  // BOOK SEAT API
  app.post("/api/book", async (req, res) => {

    const lockKey = "seat_lock"
    const lockId = uuidv4()

    try {

      const lock = await redis.set(lockKey, lockId, {
        NX: true,
        PX: 3000
      })

      if (!lock) {
        return res.json({
          success: false,
          msg: "System Busy"
        })
      }

      let seats = await redis.get("available_seats")
      seats = parseInt(seats)

      if (seats <= 0) {

        const currentLock = await redis.get(lockKey)
        if (currentLock === lockId) {
          await redis.del(lockKey)
        }

        return res.json({
          success: false,
          msg: "House Full"
        })
      }

      seats -= 1
      await redis.set("available_seats", seats)

      const currentLock = await redis.get(lockKey)
      if (currentLock === lockId) {
        await redis.del(lockKey)
      }

      res.json({
        success: true,
        bookingId: Date.now(),
        remaining: seats
      })

    } catch (err) {

      console.log(err)

      res.status(500).json({
        error: "Server Error"
      })

    }

  })

  // REMAINING SEATS
  app.get("/remaining", async (req, res) => {

    const seats = await redis.get("available_seats")

    res.json({
      remaining: parseInt(seats)
    })

  })

  // RESET SEATS
  app.post("/reset", async (req, res) => {

    await redis.set("available_seats", 100)

    res.json({
      message: "Seats reset"
    })

  })

  // UI
  app.get("/", (req, res) => {

    res.send(`

<!DOCTYPE html>
<html>

<head>

<title>Redis Seat Booking</title>

<style>

body{
font-family:Arial;
background:linear-gradient(135deg,#141e30,#243b55);
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
margin:0;
}

.container{
background:white;
color:black;
width:420px;
padding:30px;
border-radius:15px;
text-align:center;
box-shadow:0 20px 40px rgba(0,0,0,0.4);
}

.seats{
font-size:50px;
font-weight:bold;
margin:20px 0;
}

button{
padding:12px 20px;
margin:10px;
border:none;
border-radius:8px;
cursor:pointer;
font-size:16px;
}

.book{background:#28a745;color:white;}
.sim{background:#007bff;color:white;}
.reset{background:#dc3545;color:white;}

.log{
margin-top:20px;
height:120px;
overflow:auto;
border:1px solid #ddd;
padding:10px;
font-size:13px;
text-align:left;
}

</style>

</head>

<body>

<div class="container">

<h1>🎟 Redis Seat Booking</h1>

<div>Remaining Seats</div>

<div class="seats" id="seats">Loading...</div>

<button class="book" onclick="book()">Book Seat</button>

<button class="sim" onclick="simulate()">Simulate 20 Users</button>

<button class="reset" onclick="reset()">Reset</button>

<div class="log" id="log"></div>

</div>

<script>

async function fetchSeats(){

const res = await fetch('/remaining')

const data = await res.json()

document.getElementById('seats').innerText = data.remaining

}

function log(msg){

const logDiv = document.getElementById("log")

logDiv.innerHTML += msg + "<br>"

logDiv.scrollTop = logDiv.scrollHeight

}

async function book(){

log("Booking request sent")

const res = await fetch('/api/book',{method:'POST'})

const data = await res.json()

if(data.success){

log("✅ Booking Success")

}else{

log("❌ "+data.msg)

}

fetchSeats()

}

async function reset(){

await fetch('/reset',{method:'POST'})

log("Seats reset")

fetchSeats()

}

async function simulate(){

log("⚡ Simulating 20 users booking simultaneously")

for(let i=0;i<20;i++){

fetch('/api/book',{method:'POST'})
.then(res=>res.json())
.then(data=>{

if(data.success){

log("User "+i+" booked seat")

}else{

log("User "+i+" failed")

}

fetchSeats()

})

}

}

fetchSeats()

</script>

</body>

</html>

`)
  })

  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => {

    console.log("Server running on port " + PORT)

  })

}

startServer()