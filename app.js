const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
const router = new Router()

// 使用koa-bodyparser模块，用于处理请求解析
app.use(bodyParser())

const dbinfo = require('./config/dbinfo')
// 引入api模块
const userRouter = require('./routes/api/users')
router.get('/', async ctx => {
    ctx.body = {
        message: 'Hello Koa Interface.'
    }
})

// 连接数据库
mongoose.connect(dbinfo.mongodbUrl, {useNewUrlParser: true}).then(() => {
    console.log('MongoDB connected...')
}).catch(error => {
    console.log(error)
})

// 配置api路由地址
router.use("/api/users", userRouter)

app.use(router.routes()).use(router.allowedMethods())

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`server started on ${port}`)
})