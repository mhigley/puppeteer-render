const puppeteer = require('puppeteer');
require("dotenv").config();

const testLogic = async (res) => {
    const browser = await puppeteer.launch({
        args: [
            "--shm-size=1gb",
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote"
        ],
        executablePath:
            process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({width: 1920, height: 1080});
        
        const fetchBooks = async () => {
            const books = [];

            const domain = 'http://books.toscrape.com/';

            await page.goto(domain);

            const searchResultSelector = '.nav-list li li';
            await page.waitForSelector(searchResultSelector);

            const bookUrls = await page.evaluate(() => {
                const urlNodes = document.querySelectorAll('.nav-list a');
                const urlList = [...urlNodes].map(node => node.getAttribute('href'));
                return urlList;
            });

            const testUrls = [
                'catalogue/category/books_1/index.html',
                'catalogue/category/books/travel_2/index.html'
            ];

            for (const bookUrl of testUrls) {
                const url = `${domain}${bookUrl}`;

                await page.goto(url);

                await page.waitForSelector('ol li');

                const sectionTitle = await page.evaluate(() => {
                    return document.querySelector('.page-header h1')?.textContent || "not loaded";
                });
                const bookDetails = await page.evaluate(() => {
                    const allBooks = []
                    const books = document.querySelectorAll('ol li');
                    [...books].map(book => {
                        allBooks.push({
                            url: book.querySelector('h3 a')?.getAttribute('href') || "not loaded",
                            title: book.querySelector('h3 a')?.getAttribute('title') || "not loaded"
                        })
                    })

                    return allBooks;
                });

                books.push({
                    section: sectionTitle,
                    books: bookDetails
                });
            }
            return books;
        }

        const fetchQuotes = async () => {
            const quotes = [];

            const domain = 'http://quotes.toscrape.com';

            await page.goto(domain);

            const searchResultSelector = '.tags-box span';
            await page.waitForSelector(searchResultSelector);

            const quoteUrls = await page.evaluate(() => {
                const quoteNodes = document.querySelectorAll('.tags-box a');
                const quoteList = [...quoteNodes].map(node => node.getAttribute('href'));
                return quoteList;
            });

            const testUrls = [
                '/tag/love/',
                '/tag/inspirational/'
            ];

            for (const quoteUrl of testUrls) {
                const url = `${domain}${quoteUrl}`;

                await page.goto(url);

                await page.waitForSelector('.row .quote');

                const quoteCategory = await page.evaluate(() => {
                    return document.querySelector('h3 a')?.textContent || "not loaded";
                });
                const quoteDetails = await page.evaluate(() => {
                    const allQuotes = [];
                    const quotes = document.querySelectorAll('div.quote');

                    [...quotes].map(quote => {
                        allQuotes.push({
                            text: quote.querySelector('span.text')?.textContent || "not loaded",
                            author: quote.querySelector('small.author')?.textContent || "not loaded"
                        });
                    });
                    return allQuotes;
                });

                quotes.push({
                    category: quoteCategory,
                    quote: quoteDetails
                });
            }
            return quotes;
        }
        
        res.send({
            books: await fetchBooks(),
            quotes: await fetchQuotes()
        });
    } catch (err) {
        console.log(err);
        res.send(`something went wrong while running puppeteer: ${err}`);
    } finally {
        await browser.close();
    }

}

module.exports = {testLogic}