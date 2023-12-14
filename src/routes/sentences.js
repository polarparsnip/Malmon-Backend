import xss from 'xss';
import {
  addSentenceToDb,
  addSimplifiedSentenceToDb,
  conditionalUpdate,
  deleteSentenceFromDb,
  deleteSimplifiedSentenceFromDb,
  findByUserId,
  getRandomSentenceFromDb,
  getRandomSimplifiedSentenceFromDb,
  getSentenceFromDb,
  getSimplifiedSentenceFromDb,
  listAllSimplifiedSentencesFromDb,
  listSentencesFromDb,
  listSimplifiedSentencesFromDb,
} from '../lib/db.js';
import { isString } from '../lib/validation.js';

/**
 * Athugar löggildi setningar
 * @param {sentence} String setning sem á að athuga
 * @returns {Promise<Express.Response>} Niðurstaða athugunar
 */
export async function validateSentence(sentence) {
  if (typeof sentence !== 'string' || sentence.length < 10) {
    return 'Setning þarf að vera lágmark 10 stafir';
  }

  return null;
}

/**
 * Sækir allar einfaldaðar setningar ásamt upprunalegum setningum
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function listAllSimplifiedSentences(req, res) {
  const { verified = true } = req.query;

  const sentences = await listAllSimplifiedSentencesFromDb(verified);

  if (!sentences) {
    return res.status(404).json({ error: 'unable to get sentences' });
  }

  const result = {
    _links: {
      self: {
        href: `/sentences/simplified/all/?verified=${verified}`,
      },
    },
    sentences,
  };

  return res.status(200).json(result);
}

/**
 * Sækir lista yfir setningar
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
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
        href: `/admin/sentences/?offset=${offset}&limit=${limit}`,
      },
    },
    sentences,
  };

  if (offset > 0) {
    result._links.prev = {
      href: `/admin/sentences/?offset=${offset - limit}&limit=${limit}`,
    };
  }

  if (sentences.length === limit) {
    result._links.next = {
      href: `/admin/sentences/?offset=${Number(offset) + limit}&limit=${limit}`,
    };
  }

  return res.status(200).json(result);
}

/**
 * Býr til setningu
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function createSentence(req, res) {
  const { id: userId } = req.user;
  const user = await findByUserId(userId);
  const { sentence } = req.body;

  if (!user.admin) {
    return res.status(401).json({ error: 'not admin' });
  }

  const validationMessage = await validateSentence(sentence);

  if (validationMessage) {
    return res.status(400).json({ error: validationMessage });
  }

  const sanitizedSentence = isString(sentence) ? xss(sentence) : null;

  const createdSentence = await addSentenceToDb(sanitizedSentence);

  if (createdSentence) {
    return res.status(201).json(createdSentence);
  }

  return res.status(500).json({ error: 'unable to create sentence' });
}

/**
 * Uppfærir setningu
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function updateSentence(req, res) {
  const { sentenceId } = req.params;
  const { id: userId } = req.user;
  const { sentence: newSentence } = req.body;

  const user = await findByUserId(userId);

  if (!user.admin) {
    return res.status(401).json({ error: 'not admin' });
  }

  const validationMessage = await validateSentence(newSentence);

  if (validationMessage) {
    return res.status(400).json({ error: validationMessage });
  }

  const sentence = await getSentenceFromDb(sentenceId);

  if (!sentence) {
    return res.status(404).json({});
  }

  const fields = [newSentence && isString(newSentence) ? 'sentence' : null];

  const values = [
    newSentence && isString(newSentence) ? xss(newSentence) : null,
  ];

  const result = await conditionalUpdate(
    'sentences',
    sentence.id,
    fields,
    values
  );

  if (!result) {
    return res.status(500).json({ error: 'unable to update sentence' });
  }

  return res.status(200).json(result.rows[0]);
}

/**
 * Setur setningu sem að hún hafi veri einfölduð
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function setSentenceSimplified(req, res) {
  const { sentenceId } = req.params;

  const sentence = await getSentenceFromDb(sentenceId);

  if (!sentence) {
    return res.status(404).json({ error: 'original sentence not found' });
  }

  const result = await conditionalUpdate(
    'sentences',
    sentence.id,
    ['simplified'],
    ['true']
  );

  if (!result) {
    return res.status(500).json({ error: 'unable to update sentence' });
  }

  return res.status(200).json(result.rows[0]);
}

/**
 * Uppfærir einfaldaða setningu
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function updateSimplifiedSentence(req, res) {
  const { sentenceId, action } = req.params;

  const simplifiedSentence = await getSimplifiedSentenceFromDb(sentenceId);

  if (!simplifiedSentence) {
    return res.status(404).json({ error: 'simplified sentence not found' });
  }

  const field = [action === 'verify' ? 'verified' : 'rejected'];

  const value = [action === 'undo' ? 'false' : 'true'];

  const result = await conditionalUpdate(
    'simplifiedSentences',
    simplifiedSentence.id,
    field,
    value
  );

  if (!result) {
    return res
      .status(500)
      .json({ error: 'unable to update simplified sentence' });
  }

  return res.status(200).json(result.rows[0]);
}

/**
 * Eyðir setningu
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function deleteSentence(req, res) {
  const { id: userId } = req.user;

  const { sentenceId } = req.params;

  const user = await findByUserId(userId);

  if (!user.admin) {
    return res.status(401).json({ error: 'not admin' });
  }

  const sentence = await getSentenceFromDb(sentenceId);

  if (!sentence) {
    return res.status(404).json({ error: 'sentence not found' });
  }

  const result = await deleteSentenceFromDb(sentence.id);

  if (result) {
    return res.status(200).json({});
  }

  return res.status(400).json({ error: 'unable to delete sentence' });
}

/**
 * Sækir handahófskennda setningu
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function getRandomSentence(req, res) {
  const randomSentence = await getRandomSentenceFromDb();

  if (!randomSentence) {
    return res.status(404).json({ error: 'unable to get sentence' });
  }

  return res.status(200).json(randomSentence);
}

/**
 * Sækir lista yfir einfölduðum setningum
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function listSimplifiedSentences(req, res) {
  let { offset = 0, limit = 10 } = req.query;
  offset = Number(offset);
  limit = Number(limit);

  const simplifiedSentences = await listSimplifiedSentencesFromDb(
    offset,
    limit
  );

  if (!simplifiedSentences) {
    return res.status(404).json({ error: 'unable to get sentences' });
  }

  const result = {
    _links: {
      self: {
        href: `/admin/sentences/simplified/?offset=${offset}&limit=${limit}`,
      },
    },
    simplifiedSentences,
  };

  if (offset > 0) {
    result._links.prev = {
      href: `/admin/sentences/simplified/?offset=${
        offset - limit
      }&limit=${limit}`,
    };
  }

  if (simplifiedSentences.length === limit) {
    result._links.next = {
      href: `/admin/sentences/simplified/?offset=${
        Number(offset) + limit
      }&limit=${limit}`,
    };
  }

  return res.status(200).json(result);
}

/**
 * Býr til nýja einfaldaða setningu
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function createSimplifiedSentence(req, res) {
  const { simplifiedSentence, sentenceId } = req.body;

  const validationMessage = await validateSentence(simplifiedSentence);

  if (validationMessage) {
    return res.status(400).json({ error: validationMessage });
  }

  const sanitizedSimplifiedSentence = isString(simplifiedSentence)
    ? xss(simplifiedSentence)
    : null;

  const createdSimplifiedSentence = await addSimplifiedSentenceToDb(
    sanitizedSimplifiedSentence,
    sentenceId,
    req.user.id
  );

  if (createdSimplifiedSentence) {
    return res.status(201).json(createdSimplifiedSentence);
  }

  return res
    .status(500)
    .json({ error: 'unable to create simplified sentence' });
}

/**
 * Eyðir einfaldri setningu
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function deleteSimplifiedSentence(req, res) {
  const { id: userId } = req.user;
  const { sentenceId } = req.params;

  const user = await findByUserId(userId);

  if (!user.admin) {
    return res.status(401).json({ error: 'not admin' });
  }

  const simplifiedSentence = await getSimplifiedSentenceFromDb(sentenceId);

  if (!simplifiedSentence) {
    return res.status(404).json({ error: 'simplified sentence not found' });
  }

  const result = await deleteSimplifiedSentenceFromDb(simplifiedSentence.id);

  if (result) {
    return res.status(200).json({});
  }

  return res
    .status(400)
    .json({ error: 'unable to delete simplified sentence' });
}

/**
 * Sækir handahófskennda einfaldaða setningu
 * @param {req, res}
 * @returns {Promise<Express.Response>} Niðurstaða
 */
export async function getRandomSimplifiedSentence(req, res) {
  const randomSimplifiedSentence = await getRandomSimplifiedSentenceFromDb();

  if (!randomSimplifiedSentence) {
    return res.status(404).json({ error: 'unable to get simplified sentence' });
  }

  return res.status(200).json(randomSimplifiedSentence);
}
