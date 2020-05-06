const passport = require('passport');
const googleStrategy = require('passport-google-oauth20');

passport.use(
    new googleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/redirect'
    }, () => {

    })
);