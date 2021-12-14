const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 8080 

const AuthRoute = require('./routes/Auth.routes')
const UserRoute = require('./routes/User.routes')
const ProductRoute = require('./routes/Product.routes')
const OrderRoute = require('./routes/Order.routes')
const RatingRoute = require('./routes/Rating.routes')
const FeedbackRoute = require('./routes/Feedback.routes')

app.use(express.json())
app.use(cors())

app.use("/api/auth", AuthRoute)
app.use("/api/user", UserRoute)
app.use("/api/product", ProductRoute)
app.use("/api/order", OrderRoute)
app.use("/api/rating", RatingRoute)
app.use("/api/feedback", FeedbackRoute)

app.listen(port, () => {
    console.log(`server running at port ${port}`)
})