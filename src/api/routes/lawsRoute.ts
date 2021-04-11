import express from 'express';
import { crawl } from '../../services/crawler';
import { HttpException } from '../../utils/exceptions';
import { client } from "../../server";
import lawsList from '../../config/lawsList';
import { ICrawlerResponse, ILawResponse } from '../../types';

const router = express.Router();

router.get('/', (_req, res, _next) => {
  return res.status(200).json({ success: true });
});

// eslint-disable-next-line
router.get('/:law_name', async (req, res, next) => {
  const { law_name } = req.params;
  try {
    if (!law_name || !lawsList[law_name]) {
      throw new HttpException(400, "Expected law name as a param argument");
    }

    const setCache = (lawName: string): Promise<string | null> => {
      return new Promise((resolve, reject) => {
        client.get(lawName, (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
      });
    };
    const result = await setCache(law_name);

    if (result) {
      const response: ILawResponse = {
        result: JSON.parse(result) as Array<ICrawlerResponse>,
        cached: true
      };
      return res.status(200).json(response);
    } else {
      const lawData = await crawl({ url: lawsList[law_name] });
      client.setex(law_name, 20, JSON.stringify(lawData));
      return res.status(200).json({ result: lawData, cached: false });
    }

  } catch (error) {
    return next(error);
  }
});

export default router;