import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { ensureAdmin, requireAuthentication } from './passport.js';
import {
  createSentence,
  deleteSentence,
  deleteSimplifiedSentence,
  getRandomSentence,
  listAllSimplifiedSentences,
  listSentences,
  listSimplifiedSentences,
  updateSentence
} from './sentences.js';
import { deleteUser, listUsers, loginRoute, registerUser, showCurrentUser } from './users.js';


export const router = express.Router();

export async function index(req, res) {
  return res.json({
    sentences: {
        sentences: {
          href: '/sentences',
          methods: ['GET'],
        },
        sentence: {
            href: '/sentences/sentence',
            methods: ['GET'],
          },
        simplifiedSentences: {
          href: '/sentences/simplified',
          methods: ['GET'],
        },
        allSimplifiedSentences: {
          href: '/sentences/simplified/all',
          methods: ['GET'],
        },
      },
      users: {
        users: {
          href: '/users',
          methods: ['GET'],
        },
        me: {
            href: '/users/me',
            methods: ['GET'],
        },
        register: {
          href: '/users/register',
          methods: ['POST'],
        },
        login: {
          href: '/users/login',
          methods: ['POST'],
        },
        logout: {
            href: '/users/logout',
            methods: ['GET'],
        },
      },
      admin: {
        sentencesAdmin: {
          href: '/admin/sentences',
          methods: ['POST', 'PATCH', 'DELETE'],
        },
        simplifiedSentencesAdmin: {
            href: '/admin/sentences/simplified',
            methods: ['DELETE'],
        },
        usersAdmin: {
            href: '/admin/users',
            methods: ['DELETE'],
        },
      }
    });
}

//Sentences routes
router.get('/', index);
router.get('/sentences', catchErrors(listSentences));
router.get('/sentences/sentence', catchErrors(getRandomSentence));
router.get('/sentences/simplified', catchErrors(listSimplifiedSentences));
router.get('/sentences/simplified/all', catchErrors(listAllSimplifiedSentences));

//User routes
router.get('/users', catchErrors(listUsers));
router.get('/users/me', requireAuthentication, catchErrors(showCurrentUser));
router.post('/users/register', catchErrors(registerUser));
router.post('/users/login', catchErrors(loginRoute));
router.get('/users/logout', async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      // return next(err);
      return res.status(500).json({ error: err });
    }
    return res.status(200).json('logout successful');
  });
});

// Admin routes
router.post('/admin/sentences', requireAuthentication, ensureAdmin, catchErrors(createSentence));
router.patch('/admin/sentences/:sentenceId', requireAuthentication, ensureAdmin, catchErrors(updateSentence));
router.delete('/admin/sentences/:sentenceId', requireAuthentication, ensureAdmin, catchErrors(deleteSentence));

router.delete('/admin/sentences/simplified/:sentenceId', requireAuthentication, ensureAdmin, catchErrors(deleteSimplifiedSentence));

router.delete('/admin/users/:userId', requireAuthentication, ensureAdmin, catchErrors(deleteUser));