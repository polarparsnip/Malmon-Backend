import { listUsersFromDb } from "./db.js";

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