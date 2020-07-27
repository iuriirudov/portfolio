let middlewareObj = {}

middlewareObj.redirectLogin = (req, res, next) => {
    if(!req.session.userId) {
        res.redirect(`/user/login`)
    } else {
        next()
    }
}
middlewareObj.redirectHome = (req, res, next) => {
    if(req.session.userId) {
        res.redirect('/user')
    } else {
        next()
    }
}

module.exports = middlewareObj