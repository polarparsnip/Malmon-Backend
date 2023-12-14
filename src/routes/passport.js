import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { findByUserId } from '../lib/db.js';

const { JWT_SECRET: jwtSecret, TOKEN_LIFETIME: tokenLifetime = 3600 } =
  process.env;

if (!jwtSecret) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

// Hjálpar að athuga innskráningu með að athuga hvort að notandi sé til
async function strat(data, next) {
  // fáum id gegnum data sem geymt er í token
  const user = await findByUserId(data.id);

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

/**
 * Athugar hvort notandi sé admin fyrir admin endapunkta
 * @param {req, res, next}
 * @returns {next} fara í næsta fall
 */
export function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user?.admin) {
    return next();
  }

  const title = 'Síða fannst ekki';
  return res.status(404).json({ error: title });
}

/**
 * Athugar innskráningu áður fyrir endapunkt notanda
 * @param {req, res, next}
 * @returns {next} fara í næsta fall
 */
export function requireAuthentication(req, res, next) {
  return passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      const errorMessage =
        info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';

      return res.status(401).json({ error: errorMessage });
    }

    const userInfo = user;
    delete userInfo.password;

    // Látum notanda vera aðgengilegan í rest af middlewares
    req.user = userInfo;

    return next();
  })(req, res, next);
}

// authentication token stillingar
export const tokenOptions = { expiresIn: parseInt(tokenLifetime, 10) };

// jwtOptions fyrir innskráningu
export const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use(new Strategy(jwtOptions, strat));

export default passport;
