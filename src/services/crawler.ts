/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import puppeteer from "puppeteer";
import { HttpException } from "../utils/exceptions";
import { IArt, ITitles, ICrawlOptions, ICrawlerResponse } from '../types';

export const crawl = async (options: ICrawlOptions): Promise<ICrawlerResponse> => {

  const { url } = options;
  if (!url) {
    console.error(`Missing url argument. Please run 'node crawl { url }'`);
    throw new HttpException(500, `Error fetching data`);
  }

  try {
    // Initializing
    console.log("launching...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
    );

    console.log("opening new page...");
    await page.goto(url);

    // Logic
    await page.waitForTimeout(1000);

    const body: ICrawlerResponse = await page.evaluate(() => {
      const titleEl: HTMLElement | null = document.querySelector("a font");
      const title: string | undefined = titleEl?.innerText;

      const descriptionEl: HTMLElement | null = document.querySelector(
        "table p font[color='#800000'], p font[color='#800000'], table p span"
      );
      const description: string | undefined = descriptionEl?.innerText;

      // Refine creation of Titles to prevent them from being created as separate elements
      let pRaw: string[] = Array.from(<any>document.querySelectorAll("body p"), (el: HTMLElement): string => {
        return el.innerText
          .replace(/(\s\s+?|\t|\+)/gi, "")
          .replace(/Art.&nbsp;/gi, "Art. ")
          .replace("&nbsp;", "")
          .trim();
      }).filter((el: string) => {
        if (/^\s+$/gi.test(el)) {
          return false;
        }
        if (el === "*") {
          return false;
        }
        return !!el;
      });

      // Returns the article number or null
      const extractArtNum = (text: string): string | null => {
        text = text.trim();
        const art = text.match(/^Art.(\s)?.+?(\s-|\.\s|\s|\(VETADO\))+?/gi);
        if (!art || !Array.isArray(art)) return null;

        const matchArt = art[0].match(
          /(\d+?\.\d+-[a-záàâãéèêíïóôõöúçñ]|\d+?\.\d+|\d+(º+?|°+?|o+?)?-[a-záàâãéèêíïóôõöúçñ]|\d+(º+?|°+?|o+?)?)/gi
        );

        if (!matchArt || !Array.isArray(matchArt)) return null;
        if (!matchArt[0]) return null;
        if (/-o/gi.test(matchArt[0])) {
          return matchArt[0];
        }
        return matchArt[0].replace(/o/gi, "º");
      };

      // Returns the paragraph number or null
      const extractParaNum = (text: string): string | null => {
        text = text.trim();
        const para = text.match(/^§(\s+?)?\d+(?=(º+?|°+?|o+?))/gi);
        if (!para || !Array.isArray(para)) return null;

        return para[0].replace("§", "").replace(/\s+/gi, "");
      };

      // Check whether string is of type title (seção, livro, parte etc)
      const isTitle = (text: string): boolean => {
        text = text.trim();
        const titles = [
          "parte",
          "livro",
          "título",
          "capítulo",
          "seção",
          "subseção",
        ];
        const firstWordArray = text.match(/^[a-záàâãéèêíïóôõöúçñ]+/gi);

        if (!firstWordArray || !Array.isArray(firstWordArray)) return false;

        const firstWord = firstWordArray[0];
        if (!firstWord) return false;

        return titles.includes(firstWord.toLowerCase());
      };

      // Get title if text is a title
      const getTitle = (titleText: string): string => {
        const titles = [
          "parte",
          "livro",
          "título",
          "capítulo",
          "seção",
          "subseção",
        ];
        const firstWordArray = titleText.match(/^[a-záàâãéèêíïóôõöúçñ]+/gi);

        if (!firstWordArray || !Array.isArray(firstWordArray)) {
          throw new Error(`Unexpected title result`);
        }

        const firstWord = firstWordArray[0];
        if (!firstWord) {
          throw new Error(`Unexpected title result`);
        }

        if (!titles.includes(firstWord.toLowerCase())) {
          throw new Error(`Unexpected title result`);
        }

        return firstWord.toLowerCase();
      };

      const filterPara = (paraArr: string[]): string[] => {
        const newArr = [];
        let lastElemIsTitle = false;
        for (let i = 0; i < paraArr.length; i++) {
          if (
            isTitle(paraArr[i]) &&
            /^[a-záàâãéèêíïóôõöúçñ]+\s+[a-záàâãéèêíïóôõöúçñ]+$/gi.test(
              paraArr[i]
            )
          ) {
            newArr.push(paraArr[i]);
            lastElemIsTitle = true;
          } else if (lastElemIsTitle) {
            newArr[newArr.length - 1] = `${paraArr[i - 1]} - ${paraArr[i]}`;
            lastElemIsTitle = false;
          } else {
            newArr.push(paraArr[i]);
          }
        }
        return newArr;
      };

      pRaw = filterPara(pRaw);

      // Format articles into a javascript objects
      const formattedContent: Array<IArt> = [];
      const titlesArray: Array<ITitles> = [];

      // Format pRaw
      for (const el of pRaw) {
        const art = extractArtNum(el);

        // If it's an article
        if (/^Art\.(\s)?/gi.test(el)) {
          formattedContent.push({
            art: art,
            caput: el
              .replace(
                /^Art.(\s)?\d+(\.\d+)?(-[a-záàâãéèêíïóôõöúçñ]+)?(º+?|°+?|o+?)?(-[a-záàâãéèêíïóôõöúçñ]+)?(\s+?)?(\.\s+?)?(\s+?-\s+?)?/gi,
                ""
              )
              .trim()
              .replace(/^\./gi, ""),
            content: [],
          });

          titlesArray[titlesArray.length - 1].arts.push(art);
        } else {
          // Check if it's title
          if (isTitle(el)) {
            const title = getTitle(el);
            titlesArray.push({
              title,
              content: el.replace(/\n/gi, " - "),
              arts: [],
            });
          } else if (formattedContent.length > 0) {
            const subNum = extractParaNum(el);
            const regex = new RegExp(
              `${subNum}o(?=[a-záàâãéèêíïóôõöúçñ]+)`,
              "gi"
            );
            formattedContent[formattedContent.length - 1].content.push(
              el.replace(regex, `${subNum}º `)
            );
          }
        }
      }

      return {
        title,
        description,
        synopsis: titlesArray,
        formattedContent,
      };
    });

    // Finishing up
    console.log("closing...");
    await page.close();
    return body;

  } catch (error) {
    console.error(error.message);
    throw new HttpException(500, `Error fetching data`);
  }
};
