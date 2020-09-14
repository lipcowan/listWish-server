const bcrypt = require('bcryptjs')
const xss = require('xss')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    hasUserWithUserName(db, user_name) {
        return db('listwish_users')
          .where({user_name})
          .first()
          .then(user => !!user)
    },

    insertUser(db, newUser) {
        return db
          .insert(newUser)
          .into('listwish_users')
          .returning('*')
          .then(([user]) => user)
    },

    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters'
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case, lower case, number, and special character'
        }
        return null
    },

    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },

    serializeUser(user) {
        return {
            id: user.id,
            preferred_name: xss(user.preferred_name),
            user_name: xss(user.user_name),
            signup_date: new Date(user.signup_date),
        }
    },
}

module.exports = UsersService