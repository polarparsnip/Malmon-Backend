import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { findByUserId } from '../lib/db.js';

const { JWT_SECRET: jwtSecret, TOKEN_LIFETIME: tokenLifetime = 3600 } =
  process.env;

if (!jwtSecret) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

async function strat(data, next) {
  // fáum id gegnum data sem geymt er í token
  const user = await findByUserId(data.id);

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

export function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user?.admin) {
    return next();
  }

  const title = 'Síða fannst ekki';
  return res.status(404).json({ error: title });
}

export function requireAuthentication(req, res, next) {
  return passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      const error =
        info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';

      return res.status(401).json({ error });
    }

    const userInfo = user;
    delete userInfo.password;

    // Látum notanda vera aðgengilegan í rest af middlewares
    req.user = userInfo;

    return next();
  })(req, res, next);
}

export const tokenOptions = { expiresIn: parseInt(tokenLifetime, 10) };

export const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use(new Strategy(jwtOptions, strat));

export default passport;
