import puppeteer from "puppeteer";
import { HttpException } from "../utils/exceptions";
import evalPage from './evalPage';
export const crawl = async (options) => {
    const { url } = options;
    if (!url) {
        console.error(`Missing url argument on crawler function`);
        throw new HttpException(500, `Error fetching data`);
    }
    // Initializing
    console.log("launching crawler...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    if (!browser) {
        console.error("Couldn't open crawler browser");
        throw new HttpException(500, `Error fetching data`);
    }
    if (!page) {
        await browser.close();
        console.error("Couldn't open crawler page");
        throw new HttpException(500, `Error fetching data`);
    }
    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36");
        console.log("opening new page...");
        await page.goto(url);
        // Logic
        await page.waitForTimeout(500);
        const body = await page.evaluate(evalPage);
        // Finishing up
        console.log("closing page...");
        await page.close();
        console.log("closing browser...");
        await browser.close();
        return body;
    }
    catch (error) {
        // Finishing up
        console.log("closing page...");
        await page.close();
        console.log("closing browser...");
        await browser.close();
        console.error(error.message, error);
        throw new HttpException(500, `Error fetching data`);
    }
};
