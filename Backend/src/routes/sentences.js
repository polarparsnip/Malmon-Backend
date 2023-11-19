import { 
    listSentencesFromDb, 
    getRandomSentenceFromDb, 
    listSimplifiedSentencesFromDb, 
    getSentenceFromDb, 
    findByUserId, 
    getSimplifiedSentenceFromDb, 
    deleteSentenceFromDb, 
    deleteSimplifiedSentenceFromDb
} from '../lib/db.js'


export async function listSentences(req, res) {
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

export async function deleteSentence(req, res) {
    const { id: userId } = req.user;
    console.log(req.user)
    const { sentenceId } = req.params;

    const user = await findByUserId(userId);

    if (!user.admin) {
        return res.status(401).json({ error: 'not admin' });
    }

    const sentence = await getSentenceFromDb(sentenceId);

    if (!sentence) {
        return res.status(404).json({});
    }

    const result = await deleteSentenceFromDb(sentence.id);

    if (result) {
        return res.status(200).json({});
    }
    
    return res.status(400).json({ error: 'unable to delete sentence' });
}

export async function getRandomSentence(req, res) {
    const randomSentence = await getRandomSentenceFromDb();
  
    if (!randomSentence) {
        return res.status(404).json({ error: 'unable to get sentence' });
    }
  
    return res.status(200).json(randomSentence);
}

export async function listSimplifiedSentences(req, res) {
    let { offset = 0, limit = 10 } = req.query;
    offset = Number(offset);
    limit = Number(limit);
  
    const simplifiedSentences = await listSimplifiedSentencesFromDb(offset, limit);
    
    if (!simplifiedSentences) {
        return res.status(404).json({ error: 'unable to get sentences' });
    }

    const result = {
      _links: {
        self: {
          href: `/sentences/simplified/?offset=${offset}&limit=${limit}`,
        },
      },
      simplifiedSentences,
    };
  
    if (offset > 0) {
      result._links.prev = {
        href: `/sentences/simplified/?offset=${offset - limit}&limit=${limit}`,
      };
    }
  
    if (simplifiedSentences.length === limit) {
      result._links.next = {
        href: `/sentences/simplified/?offset=${Number(offset) + limit}&limit=${limit}`,
      };
    }

    return res.status(200).json(result);
}

export async function deleteSimplifiedSentence(req, res) {
    const { id: userId } = req.user;
    const { sentenceId } = req.params;

    const user = await findByUserId(userId);
    
    if (!user.admin) {
        return res.status(401).json({ error: 'not admin' });
    }

    const sentence = await getSimplifiedSentenceFromDb(sentenceId);

    if (!sentence) {
        return res.status(404).json({});
    }

    const result = await deleteSimplifiedSentenceFromDb(sentence.id);
    
    if (result) {
        return res.status(200).json({});
    }
    
    return res.status(400).json({ error: 'unable to delete simplified sentence' });
}
