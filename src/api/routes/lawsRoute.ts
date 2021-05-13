import express from 'express';
import { crawl } from '../../services/crawler';
import { HttpException } from '../../utils/exceptions';
// import { client } from "../../server";
import lawsList from '../../config/lawsList';
// import { ICrawlerResponse, ILawResponse } from '../../types';
import { prisma } from '../../server';
import passport from 'passport';

const router = express.Router();

router.get('/', (_req, res, _next) => {
  return res.status(200).json({ success: true });
});

router.get('/:law_name', async (req, res, next) => {
  const { law_name } = req.params;
  try {
    if (!law_name || !lawsList[law_name]) {
      throw new HttpException(400, "Expected law name as a param argument");
    }

    // const setCache = (lawName: string): Promise<string | null> => {
    //   return new Promise((resolve, reject) => {
    //     client.get(lawName, (err, result) => {
    //       if (err) {
    //         return reject(err);
    //       }
    //       return resolve(result);
    //     });
    //   });
    // };
    // const result = await setCache(law_name);

    const url = lawsList[law_name];

    const result = await prisma.law.findUnique({
      where: {
        url
      }
    });

    if (result) {
      // const response: ILawResponse = {
      //   result: JSON.parse(result) as Array<ICrawlerResponse>,
      //   cached: true
      // };

      const response = {
        result: { ...result, url },
        cached: true
      };

      return res.status(200).json(response);
    } else {
      const law = await crawl({ url });

      // if (!law.title) return;

      console.log('law: ', JSON.stringify(law));

      const savedLaw = await prisma.law.create({
        data: {
          title: law.title,
          updatedAt: new Date(),
          description: law.description,
          header: law.header,
          footer: law.footer,
          synopsis: JSON.stringify(law.synopsis),
          content: JSON.stringify(law.content),
          url: url
        } as any
      });

      // client.setex(law_name, 20, JSON.stringify(lawData));
      return res.status(200).json({ result: savedLaw, cached: false });
    }

  } catch (error) {
    return next(error);
  }
});

router.post("/update_all", passport.authenticate('jwt', { session: false }), async (req: any, res, next) => {
  if (req.user.role !== 'ADMIN') {
    throw new HttpException(403, "Unauthorized action");
  }

  try {
    const startTime = +new Date();

    let count = 0;
    for (let key in lawsList) {
      const url = lawsList[key];

      const crawledLaw = await crawl({ url });

      if (!crawledLaw) continue;
      if (!crawledLaw.title || !crawledLaw.description) continue;

      const createdOrUpdated = await prisma.law.upsert({
        where: {
          url
        },
        update: {
          title: crawledLaw.title,
          updatedAt: new Date(),
          description: crawledLaw.description,
          header: crawledLaw.header,
          footer: crawledLaw.footer,
          synopsis: JSON.stringify(crawledLaw.synopsis),
          content: JSON.stringify(crawledLaw.content)
        } as any,
        create: {
          title: crawledLaw.title,
          updatedAt: new Date(),
          description: crawledLaw.description,
          header: crawledLaw.header,
          footer: crawledLaw.footer,
          synopsis: JSON.stringify(crawledLaw.synopsis),
          content: JSON.stringify(crawledLaw.content),
          url: url
        } as any
      });

      if (createdOrUpdated) {
        count++;
      }
    }

    const endTime = +new Date();

    const timeTaken = endTime - startTime;

    return res.status(200)
      .json({ message: `${count} items modified. Execution time: ${timeTaken} ms.` });
  } catch (error) {
    console.error(error);
    return next(error);
  }

});

export default router;