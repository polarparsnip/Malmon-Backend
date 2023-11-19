import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { listSentences } from './sentences.js';


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
      }
    });
}

router.get('/', index);
router.get('/sentences', catchErrors(listSentences));