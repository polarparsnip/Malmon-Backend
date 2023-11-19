import jwt from 'jsonwebtoken';
import { jwtOptions, tokenOptions } from './passport.js'
import { comparePasswords, findByUsername, findUserById, listUsersFromDb } from "../lib/db.js";

export async function listUsers(req, res) {
    let { offset = 0, limit = 10 } = req.query;
    offset = Number(offset);
    limit = Number(limit);
  
    const users = await listUsersFromDb(offset, limit);
    
    if (!users) {
      return res.status(404).json({ error: 'unable to list users' });
    }
  
    const result = {
      _links: {
        self: {
          href: `/users/?offset=${offset}&limit=${limit}`,
        },
      },
      users,
    };
  
    if (offset > 0) {
      result._links.prev = {
        href: `/users/?offset=${offset - limit}&limit=${limit}`,
      };
    }
  
    if (users.length === limit) {
      result._links.next = {
        href: `/users/?offset=${Number(offset) + limit}&limit=${limit}`,
      };
    }
  
    return res.status(200).json(result);
}

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

export async function showCurrentUser(req, res) {
    const { user: { id } = {} } = req;
  
    const user = await findUserById(id);
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    delete user.password;
  
    return res.json(user);
}