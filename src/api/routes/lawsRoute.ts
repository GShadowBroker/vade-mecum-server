import express from 'express';
import { crawl } from '../../services/crawler';
import { HttpException } from '../../utils/exceptions';
import lawsList from '../../config/lawsList';
import { prisma } from '../../server';
import passport from 'passport';

const router = express.Router();

router.get('/', (_req, res, _next) => {
  return res.status(200).json({ success: true });
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get("/search", async (req: any, res, next) => {
  try {
    const { q } = req.query as { q: string; };

    if (!q) {
      throw new HttpException(400, "No query parameter found");
    }

    const laws = await prisma.law.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true
      },
      distinct: ['id']
    });

    if (!laws) {
      throw new HttpException(404, "No matches found");
    }

    return res.status(200).json({ matches: laws });

  } catch (error) {
    return next(error);
  }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/:law_name', async (req, res, next) => {
  const { law_name } = req.params as { law_name: string; };
  try {
    if (!law_name || !lawsList[law_name]) {
      throw new HttpException(400, "Expected law name as a param argument");
    }

    const url = lawsList[law_name];

    const result = await prisma.law.findUnique({
      where: {
        url
      }
    });

    if (result) {

      const response = {
        result: { ...result, url },
        cached: true
      };

      return res.status(200).json(response);
    } else {
      const law = await crawl({ url });

      interface ISavedLawData {
        title: string;
        updatedAt: Date;
        description: string;
        header: string[];
        footer: string[];
        synopsis: string;
        content: string;
        url: string;
      }

      const savedLaw = await prisma.law.create({
        data: <ISavedLawData>{
          title: law.title,
          updatedAt: new Date(),
          description: law.description,
          header: law.header,
          footer: law.footer,
          synopsis: JSON.stringify(law.synopsis),
          content: JSON.stringify(law.content),
          url: url
        }
      });

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
    for (const key in lawsList) {
      const url = lawsList[key];

      const crawledLaw = await crawl({ url });

      if (!crawledLaw) continue;
      if (!crawledLaw.title || !crawledLaw.description) continue;

      interface IUpdateLaw {
        title: string;
        updatedAt: Date;
        description: string;
        header: string[];
        footer: string[];
        synopsis: string;
        content: string;
      }
      interface ICreateLaw extends IUpdateLaw {
        url: string;
      }

      const createdOrUpdated = await prisma.law.upsert({
        where: {
          url
        },
        update: <IUpdateLaw>{
          title: crawledLaw.title,
          updatedAt: new Date(),
          description: crawledLaw.description,
          header: crawledLaw.header,
          footer: crawledLaw.footer,
          synopsis: JSON.stringify(crawledLaw.synopsis),
          content: JSON.stringify(crawledLaw.content)
        },
        create: <ICreateLaw>{
          title: crawledLaw.title,
          updatedAt: new Date(),
          description: crawledLaw.description,
          header: crawledLaw.header,
          footer: crawledLaw.footer,
          synopsis: JSON.stringify(crawledLaw.synopsis),
          content: JSON.stringify(crawledLaw.content),
          url: url
        }
      });

      if (createdOrUpdated) {
        count++;
      }
    }

    const endTime = +new Date();

    const timeTaken = endTime - startTime;

    return res.status(200)
      .json({ message: `${count} items saved. Execution time: ${timeTaken} ms.` });
  } catch (error) {
    console.error(error);
    return next(error);
  }

});

export default router;