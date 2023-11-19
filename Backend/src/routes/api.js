import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { listSentences, getRandomSentence, listSimplifiedSentences } from './sentences.js';
import { listUsers } from '../lib/users.js';


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
      },
      users: {
        users: {
          href: '/users',
          methods: ['GET'],
        },
        register: {
          href: '/users/register',
          methods: ['GET', 'POST'],
        },
        login: {
          href: '/users/login',
          methods: ['GET', 'POST'],
        },
        logout: {
            href: '/users/logout',
            methods: ['GET'],
        },
        me: {
          href: '/users/me',
          methods: ['GET'],
        },
      },
      admin: {
        sentences: {
          href: '/admin/sentences',
          methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        },
        simplifiedSentences: {
            href: '/admin/sentences/simplified',
            methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        },
        users: {
            href: '/admin/users',
            methods: ['GET', 'DELETE'],
        },
      }
    });
}

//Sentences routes
router.get('/', index);
router.get('/sentences', catchErrors(listSentences));
router.get('/sentences/sentence', catchErrors(getRandomSentence));
router.get('/sentences/simplified', catchErrors(listSimplifiedSentences));

//User routes
router.get('/users', catchErrors(listUsers));