import jwt from 'jsonwebtoken';
import { jwtOptions, tokenOptions } from './passport.js'
import { comparePasswords, createUser, findByUsername, findByUserId, listUsersFromDb, deleteUserFromDb } from "../lib/db.js";

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
  
    const user = await findByUserId(id);
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    delete user.password;
  
    return res.json(user);
}

export async function validateUser(name, username, password) {
  if (typeof name !== 'string' || name.length < 2 || username.length > 64) {
    return 'Skrá þarf nafn. Lágmark 2 stafir og hámark 64 stafir';
  }

  if (typeof username !== 'string' || username.length < 2 || username.length > 64) {
    return 'Skrá þarf notendanafn. Lágmark 2 stafir og hámark 64 stafir';
  }

  const user = await findByUsername(username);

  if (user === null) {
    return 'Gat ekki athugað notendanafn';
  }

  if (user) {
    return 'Notendanafn er þegar skráð';
  }

  if (typeof password !== 'string' || password.length < 3 || username.length > 256) {
    return 'Skrá þarf lykilorð. Lágmark 3 stafir';
  }

  return null;
}

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
  