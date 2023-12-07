import jwt from 'jsonwebtoken';
import {
  comparePasswords,
  conditionalUpdate,
  createUser,
  deleteUserFromDb,
  findByUserId,
  findByUsername,
  listUsersFromDb,
} from '../lib/db.js';
import { jwtOptions, tokenOptions } from './passport.js';

/**
 * Sækir lista yfir notendur
 * @param {req, res}
 * @returns {Promise<Express.Response>} Listi yfir notendur
 */
export async function listUsers(req, res) {
  let { order = 'default', offset = 0, limit = 10 } = req.query;
  offset = Number(offset);
  limit = Number(limit);
  order = String(order);

  const users = await listUsersFromDb(order, offset, limit);

  if (!users) {
    return res.status(404).json({ error: 'unable to list users' });
  }

  const result = {
    _links: {
      self: {
        href: `/users/?order=${order}&offset=${offset}&limit=${limit}`,
      },
    },
    users,
  };

  if (offset > 0) {
    result._links.prev = {
      href: `/users/?order=${order}&offset=${offset - limit}&limit=${limit}`,
    };
  }

  if (users.length === limit) {
    result._links.next = {
      href: `/users/?order=${order}&offset=${
        Number(offset) + limit
      }&limit=${limit}`,
    };
  }

  return res.status(200).json(result);
}

/**
 * Skráir inn notanda
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða Innskráningar
 */
export async function loginRoute(req, res) {
  const { username, password = '' } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid user/password' });
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    delete user.password;
    return res.status(200).json({
      user,
      token,
      expiresIn: tokenOptions.expiresIn,
    });
  }
  return res.status(401).json({ error: 'Invalid user/password' });
}

/**
 * Sýnir núverandi notanda
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function showCurrentUser(req, res) {
  const { user: { id } = {} } = req;

  const user = await findByUserId(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete user.password;

  return res.json(user);
}

/**
 * Athugar í nýskráningu hvort gildi notanda séu lögleg
 * @param {name, username, password}
 * nafn, notandanafn, og lykilorð sem notandi vill nota
 * @returns {String} Niðurstaða athugunar
 */
export async function validateUser(name, username, password) {
  if (typeof name !== 'string' || name.length < 2 || username.length > 64) {
    return 'Skrá þarf nafn. Lágmark 2 stafir og hámark 64 stafir';
  }

  if (
    typeof username !== 'string' ||
    username.length < 2 ||
    username.length > 64
  ) {
    return 'Skrá þarf notendanafn. Lágmark 2 stafir og hámark 64 stafir';
  }

  const user = await findByUsername(username);

  if (user === null) {
    return 'Gat ekki athugað notendanafn';
  }

  if (user) {
    return 'Notendanafn er þegar skráð';
  }

  if (
    typeof password !== 'string' ||
    password.length < 3 ||
    username.length > 256
  ) {
    return 'Skrá þarf lykilorð. Lágmark 3 stafir';
  }

  return null;
}

/**
 * Nýskráir notanda
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða Nýskráningar
 */
export async function registerUser(req, res) {
  const { name, username, password } = req.body;

  const validationMessage = await validateUser(name, username, password);

  if (validationMessage) {
    return res.status(400).json(validationMessage);
  }

  const user = await createUser(name, username, password);

  if (!user) {
    return res.status(400).json({ error: 'could not create user' });
  }

  delete user.password;

  return res.status(201).json(user);
}

/**
 * Eyðir notanda
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða eyðslunnar
 */
export async function deleteUser(req, res) {
  const { id: userId } = req.user;
  const { userId: userToBeDeletedId } = req.params;

  const user = await findByUserId(userId);

  if (!user.admin) {
    return res.status(401).json({ error: 'not admin' });
  }

  const userToBeDeleted = await findByUserId(userToBeDeletedId);

  if (!userToBeDeleted) {
    return res.status(404).json({});
  }

  const result = await deleteUserFromDb(userToBeDeleted.id);

  if (result) {
    return res.status(200).json({});
  }

  return res.status(400).json({ error: 'unable to delete user' });
}

/**
 * Uppfærir notanda
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða uppfærslunnar
 */
export async function updateUser(req, res) {
  // const { userId } = req.params;
  const { id: userId } = req.user;
  const { completedSentences, completedVerifications } = req.body;

  const user = await findByUserId(userId);

  if (!user) {
    return res.status(404).json({});
  }

  const fields = [
    completedSentences ? 'completedSentences' : null,
    completedVerifications ? 'completedVerifications' : null,
  ];

  const values = [
    completedSentences ? Number(user.completedsentences) + 1 : null,
    completedVerifications ? Number(user.completedverifications) + 1 : null,
  ];

  const result = await conditionalUpdate('users', user.id, fields, values);

  if (!result) {
    return res.status(500).json({ error: 'unable to update user' });
  }

  return res.status(200).json(result.rows[0]);
}
