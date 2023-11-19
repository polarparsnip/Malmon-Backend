import { listSentencesFromDb } from '../lib/db.js'


export async function listSentences(req, res) {
    const { user } = req;
    console.log(user);

    let { offset = 0, limit = 10 } = req.query;
    offset = Number(offset);
    limit = Number(limit);
  
    const sentences = await listSentencesFromDb(offset, limit);
    
    if (!sentences) {
        return res.status(404).json({ error: 'unable to get sentences' });
    }

    const result = {
      _links: {
        self: {
          href: `/sentences/?offset=${offset}&limit=${limit}`,
        },
      },
      sentences,
    };
  
    if (offset > 0) {
      result._links.prev = {
        href: `/sentences/?offset=${offset - limit}&limit=${limit}`,
      };
    }
  
    if (sentences.length === limit) {
      result._links.next = {
        href: `/sentences/?offset=${Number(offset) + limit}&limit=${limit}`,
      };
    }

    return res.status(200).json(result);
}