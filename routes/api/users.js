const Router = require('koa-router')
const router = new Router()
const utils = require('../../utils/utils')
const jwt = require('jsonwebtoken')
const tokenCFG = require('../../config/token')

// 引入User 
const User = require('../../models/User')


// /api/user/test 
/**
 * @route GET /api/users/test/
 * @desc 测试接口地址
 * @access 公开
 */
// router.get('/test', async ctx => {
//     ctx.status = 200
//     ctx.body = {msg: 'users works...'}
// })

/**
 * @route POST /api/users/register
 * @desc 注册接口地址
 * @access 公开
 */
router.post('/register', async ctx => {
    // console.log(JSON.stringify(ctx.request.body))
    // ctx.body = ctx.request.body
    // 存储到数据库
    const findRst = await User.find({ email: ctx.request.body.email })
    // console.log(findRst)
    if (findRst.length > 0) {
        ctx.status = 500
        ctx.body = { email: '邮箱已被占用' }
    } else {
        // 没有查到
        const newUser = new User({
            name: ctx.request.body.name,
            email: ctx.request.body.email,
            avatar: utils.gravatar(ctx.request.body.email),
            password: utils.enbcryptSync(ctx.request.body.password)// 给密码添加哈希加密
        })

        // console.log(newUser)
        // 保存至数据库
        await newUser.save().then(user => {
            ctx.body = user
        }).catch(error => {
            console.log(error)
        })
        ctx.body = newUser
    }
})

/**
 * @route POST /api/users/login
 * @desc 登录接口地址
 * @access 公开
 */
router.post('/login', async ctx => {
    let findRst = await User.find({ email: ctx.request.body.email })
    if (findRst.length === 0) {
        ctx.state = 200
        ctx.body = {
            code: 200,
            message: '用户不存在！',
            obj: null
        }
    } else {
        let rst = utils.valitePwdSync(ctx.request.body.password, findRst[0].password)
        if (rst) {
            let {
                _id,
                name,
                email,
                avatar,
                date
            } = findRst[0]

            // 返回token
            let tokenHeader = 'Bearer '
            let tokenContent = jwt.sign({ _id, name, email, avatar, date }, tokenCFG.privateKey, { expiresIn: 60 })
            ctx.status = 200
            ctx.body = {
                code: 200,
                message: '登录成功',
                obj: { tokenHeader, tokenContent }
            }
        } else {
            ctx.status = 400
            ctx.body = {
                code: 400,
                message: '登录密码错误！',
                obj: null
            }
        }
    }
})


/**
 * @route GET /api/users/current
 * @desc 获取当前用户信息接口地址
 * @access 私密
 */
router.get('/current', async ctx => {
    let auth = ctx.headers.authorization
    let token = auth.split(' ')[1]
    jwt.verify(token, tokenCFG.privateKey, (err, payload) => {
        if (err) {
            if (err.name == "TokenExpiredError") {
                ctx.status = 401
                // ctx.body = {
                //     code: 401,
                //     message: 'token已过期',
                //     obj: null
                // }
            } 
        }else {
            ctx.status = 200
            ctx.body = {
                code: 200,
                message: '认证成功',
                obj: {
                    payload
                }
            }
        }
    })
})




module.exports = router.routes()