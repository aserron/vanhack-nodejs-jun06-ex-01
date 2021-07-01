// requests library
const axios = require("axios");

// your choice of HTML parser
const cheerio = require("cheerio");
const jsdom = require("jsdom");

const express = require("express");

const BASE_URL = 'http://quotes.toscrape.com';

const AUTHOR_NAME_ARR = ['Albert Einstein', 'J.K. Rowling', 'Jane Austen', 'Marilyn Monroe', 'André Gide', 'Thomas A. Edison', 'Eleanor Roosevelt', 'Steve Martin', 'Bob Marley', 'Dr. Seuss', 'Douglas Adams', 'Elie Wiesel', 'Friedrich Nietzsche', 'Mark Twain', 'Allen Saunders', 'Pablo Neruda', 'Ralph Waldo Emerson', 'Mother Teresa', 'Garrison Keillor', 'Jim Henson', 'Charles M. Schulz', 'William Nicholson', 'Jorge Luis Borges', 'George Eliot', 'George R.R. Martin', 'C.S. Lewis', 'Martin Luther King Jr.', 'James Baldwin', 'Haruki Murakami', 'Alexandre Dumas-fils', 'Stephenie Meyer', 'Ernest Hemingway', 'Helen Keller', 'George Bernard Shaw', 'Charles Bukowski', 'Suzanne Collins', 'J.R.R. Tolkien', 'Alfred Tennyson', 'Terry Pratchett', 'J.D. Salinger', 'George Carlin', 'John Lennon', 'W.C. Fields', 'Ayn Rand', 'Jimi Hendrix', 'J.M. Barrie', 'E.E. Cummings', 'Khaled Hosseini', 'Harper Lee', "Madeleine L'Engle"]

const ScrapperService = {

    // static BASE_URL = 'http://quotes.toscrape.com'

    getAllQuotesConcurrent: async () => {
        const parseQuote = (elem, $) => {

            let tags = $(elem).find("meta[itemprop='keywords']").attr('content')

            return {
                author: $(elem).find("[itemprop='author']").text(),
                // author_about: $(elem).find("a").attr('href'),
                text: $(elem).find("[itemprop='text']").text().slice(0, 50),
                tags: (tags.length > 0) ? tags.split(',') : []
            }
        };
        // https://quotes.toscrape.com/page/11/

        let promises = []

        for (let num = 1; num < 11; num++) {

            // let name = list[num];
            // let fixed = fixAuthorName(name);
            let url = BASE_URL + `/page/${num}`

            // console.log('target: ', url)

            promises.push(
                axios({method: "get", url: url})
                    .then(html => {

                        let data = []

                        // Parse your result with Cheerio or whatever you like
                        const $ = cheerio.load(html.data);

                        $("div.quote").each((i, elem) => {
                            data.push(parseQuote(elem, $))
                        })

                        return data;

                    })
            );
        }

        return Promise.all(promises)

    },


    getAllQuotes: async () => {

        const parseQuote = (elem, $) => {

            let tags = $(elem).find("meta[itemprop='keywords']").attr('content')

            return {
                author: $(elem).find("[itemprop='author']").text(),
                // author_about: $(elem).find("a").attr('href'),
                text: $(elem).find("[itemprop='text']").text().slice(0, 50),
                tags: (tags.length > 0) ? tags.split(',') : []
            }
        };

        const html = await axios.get(BASE_URL);
        const $ = await cheerio.load(html.data);
        let data = []

        $("div.quote").each((i, elem) => {
            data.push(parseQuote(elem, $))
        })

        // console.log(data)

        let nextLink = $("li.next").find("a").attr("href");

        while (nextLink) {
            const url = BASE_URL + nextLink;
            console.log('target: next:', url)

            const html = await axios.get(url);
            const $ = await cheerio.load(html.data);

            $("div.quote").each((i, elem) => {
                data.push(parseQuote(elem, $))
            })

            nextLink = $("li.next").find("a").attr("href");
        }

        return data;
    },

    getQuotesByTag: async (tag) => {

        const url = BASE_URL + `/tag/${tag}`
        const html = await axios.get(url);
        const $ = cheerio.load(html.data);

        // console.log('target: ', url)

        let data = []

        $("div.quote").each((i, elem) => {
            data.push({
                author: $(elem).find("[itemprop='author']").text().trim(),
                // author_about: $(elem).find("a").attr('href'),
                text: $(elem).find("[itemprop='text']").text().slice(0, 50),
                tags: $(elem).find("meta[itemprop='keywords']").attr('content').split(',')
            })
        })


        let nextLink = $("li.next").find("a").attr("href");

        while (nextLink) {

            const url = BASE_URL + nextLink;
            // console.log('target: next:', url)

            const html = await axios.get(url);
            const $ = cheerio.load(html.data);

            $("div.quote").each((i, elem) => {
                data.push({
                    author: $(elem).find("[itemprop='author']").text().trim(),
                    // author_about: $(elem).find("a").attr('href'),
                    text: $(elem).find("[itemprop='text']").text().slice(0, 50),
                    tags: $(elem).find("meta[itemprop='keywords']").attr('content').split(',')
                })
            })

            nextLink = $("li.next").find("a").attr("href");
        }

        return data;
    },

    getAuthor: async (author) => {

        const fixAuthorName = name => {
            return name.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[\s\.]/g, '-')
                .replace(/-+/g, '-')
        }

        const parseAuthor = (elem) => {
            return {
                name     : $(elem).find("h3.author-title").text().trim(),
                biography: $(elem).find("div.author-description").text().trim().slice(0, 50),
                birthdate: $(elem).find("span.author-born-date").text().trim(),
                location : $(elem).find("span.author-born-location").text().trim()
            }
        }


        const fixed = fixAuthorName(author);
        const url = BASE_URL + `/author/${fixed}/`
        const html = await axios.get(url);
        const $ = cheerio.load(html.data);

        // console.log('target: ', url)

        let data;

        $("div.author-details").each((i, elem) => {
            data = parseAuthor(elem)
        })

        return (data.name === '') ? [] : [data];
    },

    getAllAuthor: async () => {

        const fixAuthorName = name => {
            return name.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[\s\.]/g, '-')
                .replace(/-+/g, '-')
                .replace(/-$|'/g, '')
        }

        const parseAuthor = (elem, $) => {
            return {
                name     : $(elem).find("h3.author-title").text().trim(),
                biography: $(elem).find("div.author-description").text().trim().slice(0, 50),
                birthdate: $(elem).find("span.author-born-date").text().trim(),
                location : $(elem).find("span.author-born-location").text().trim()
            }
        }


        const list = AUTHOR_NAME_ARR;

        let promises = []

        for (let i = 0; i < list.length; i++) {

            let name = list[i];
            let fixed = fixAuthorName(name);
            let url = BASE_URL + `/author/${fixed}/`

            // console.log('target: ', url)

            promises.push(
                axios({method: "get", url: url})
                    .then(html => {

                        let data = []

                        // Parse your result with Cheerio or whatever you like
                        const $ = cheerio.load(html.data);

                        $("div.author-details").each((i, elem) => {
                            let o = parseAuthor(elem, $);
                            // o.url = html.config.url;
                            data.push(o)
                            // return parseAuthor(elem, $)
                        })

                        return data[0];

                    })
            );
        }

        return Promise.all(promises)


        // return data;

    }


}

const createService = () => {

    const scrap = ScrapperService;

    const app = express();

    app.get('/', function (req, res, next) {

        res.status(200).json({data: []})

    })

    app.get('/quotes', function (req, res, next) {

        let results = [];

        const {tag} = req.query;


        if ((tag === undefined)) {

            scrap.getAllQuotesConcurrent().then(results=>{

                let resultsArr = [
                    ...results[0],
                    ...results[1],
                    ...results[2],
                    ...results[3],
                    ...results[4],
                    ...results[5],
                    ...results[6],
                    ...results[7],
                    ...results[8],
                    ...results[9]
                ]

                res.status(200).json({'data':resultsArr})

            })
                .catch(next)
            // results      = results.reduce((acc,item) => acc.concat(item),[])

            // let results = await scrap.getAllQuotes()





        } else if (tag !== undefined) {

            scrap.getQuotesByTag(tag)
                .then(results => {
                    res.status(200).json({'data': results})
                })
                .catch(next)

        } else {

            res.status(200).json({'data': []})
        }
    });


    app.get('/authors', function (req, res, next) {

        const {name} = req.query;

        if ((name !== undefined)) {

            scrap.getAuthor(name)
                .then((results) => {
                        res.status(200).json({data: results})
                    }
                )
                .catch((err) => {
                        console.log(err)
                        return next;
                    }
                )
            // let results = [{}]


        } else {

            scrap.getAllAuthor().then(results => {
                    res.status(200).json({data: results})
                }
            ).catch(next)


        }
    });

    /* go ahead and code! */



    app.use(function (err, req, res, next) {
        // handle error
        console.log()
        console.log('[ERROR]', err)
        return next;
    })

    return app;
};

module.exports = {createService};