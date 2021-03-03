const bcrypt = require('bcryptjs')
// md5加密模块
const MD5 = require('md5.js')

const tools = {
    // hash密码加密
    enbcryptSync(data) {
        var salt = bcrypt.genSaltSync(10)
        var hash = bcrypt.hashSync(data, salt)
        return hash
    },
    // 密码校验
    valitePwdSync(password, hash) {
        return bcrypt.compareSync(password, hash)
    },

    // 生成头像
    gravatar(email,size=100, def='identicon', rating='g') {
        let url = 'https://cdn.v2ex.com/gravatar'
        let hash = new MD5().update(email).digest('hex')
        return `${url}/${hash}?s=${size}&d=${def}&r=${rating}`
    }
}

module.exports = tools