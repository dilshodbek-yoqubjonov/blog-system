const jwt = require("jsonwebtoken")

const sign = (payload) => {
    return jwt.sign(payload, "SECRET_KEY")
}

const verify = (token) => {
   return jwt.verify(token, "SECRET_KEY")
}

module.exports = {
    sign, verify
}
