const passport = require('passport');
const googleStrategy = require('passport-google-oauth20');

const Usuario = require('./../repositorys/usuario');

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    const user = Usuario.getById(id);
    done(null, user);
});

passport.use(
    new googleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/redirect'
    }, async (accessToken, refreshToken, profile, done) => {
        let googleUser = null;
        const user = await Usuario.getByEmail(profile.emails[0].value);

        if(user) googleUser = await Usuario.getByGoogleId(profile.id);
        
        if (!googleUser && !user) {
            try {
                const newUser = await Usuario.save({
                    nome: profile.name.givenName,
                    sobrenome: profile.name.familyName,
                    email: profile.emails[0].value,
                    img_perfil: profile.photos[0].value,
                    google_id: profile.id,
                    email_validado: true
                });
                return done(null, newUser);
            } catch(error) {
                console.log(error);
                return done(error, { err: "Error" });
            }
        } else  if (user && !googleUser) {
            user.google_id = profile.id;
            await Usuario.update(user.id, user);
        }

        return done(null, user);
    })
);