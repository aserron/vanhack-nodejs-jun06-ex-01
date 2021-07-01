// create quotes scraapping

console.log("\n\n","Loading Module: Scrapper Service","\n")

const axios   = require('axios');
const jsdom   = require('jsdom');
const cheerio = require("cheerio");
const {JSDOM} = jsdom;

//const BASE_URL = 'http://quotes.toscrape.com/tag/inspirational/';
const BASE_URL = 'http://quotes.toscrape.com';

const AUTHOR_NAME_ARR = [
    'Albert Einstein', 'J.K. Rowling', 'Jane Austen', 'Marilyn Monroe', 'André Gide', 'Thomas A. Edison',
    'Eleanor Roosevelt', 'Steve Martin', 'Bob Marley', 'Dr. Seuss', 'Douglas Adams', 'Elie Wiesel',
    'Friedrich Nietzsche', 'Mark Twain', 'Allen Saunders', 'Pablo Neruda', 'Ralph Waldo Emerson', 'Mother Teresa',
    'Garrison Keillor', 'Jim Henson', 'Charles M. Schulz', 'William Nicholson', 'Jorge Luis Borges', 'George Eliot',
    'George R.R. Martin', 'C.S. Lewis', 'Martin Luther King Jr.', 'James Baldwin', 'Haruki Murakami',
    'Alexandre Dumas-fils', 'Stephenie Meyer', 'Ernest Hemingway', 'Helen Keller', 'George Bernard Shaw',
    'Charles Bukowski', 'Suzanne Collins', 'J.R.R. Tolkien', 'Alfred Tennyson', 'Terry Pratchett', 'J.D. Salinger',
    'George Carlin', 'John Lennon', 'W.C. Fields', 'Ayn Rand', 'Jimi Hendrix', 'J.M. Barrie', 'E.E. Cummings',
    'Khaled Hosseini', 'Harper Lee', "Madeleine L'Engle"
]

// MODULE LEVEL CONSTANTS.
const singleton         = Symbol();
const singletonEnforcer = Symbol()
let   instance          = null;

class ScrapperService {
    
    cache (){
        return this._cache;
    }
    constructor(enforcer) {
        
        if (instance != null) throw "Cannot construct singleton";
    
        console.log()
        console.log("[ScrapperService] creating instance","\n")
        
        this._cache = new Map();
        
    }
    
    static get instance() {
        if (instance===null) {
            instance = new ScrapperService();
        }
        return instance;
    }
    
    // static BASE_URL = 'http://quotes.toscrape.com'
    
    static async getAllQuotesConcurrent() {
        
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
        
        let all = []
        
        for (let num = 1; num < 11; num++) {
            
            // let name = list[num];
            // let fixed = fixAuthorName(name);
            let url = BASE_URL + `/page/${num}`
            
            // console.log('target: ', url)
            
            
            promises.push(
                axios({method: "get", url: url})
            );
        }
        
        
        return Promise.all(promises).then(
            htmlList => {
                
                let data = []
                
                
                htmlList.forEach(html => {
                    
                    // Parse your result with Cheerio or whatever you like
                    const $ = cheerio.load(html.data, {}, false);
                    
                    $("div.quote").each((i, elem) => {
                        
                        let quoteEl = parseQuote(elem, $);
                        
                        data.push(quoteEl)
                        
                        all.push(quoteEl)
                    })
                    
                })
                
                
                return data;
                
            })
    }
    
    
    static async getAllQuotes() {
        
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
        const $    = await cheerio.load(html.data);
        let data   = []
        
        $("div.quote").each((i, elem) => {
            data.push(parseQuote(elem, $))
        })
        
        // console.log([getAllQuotes] data)
        
        let nextLink = $("li.next").find("a").attr("href");
        
        while (nextLink) {
            const url = BASE_URL + nextLink;
            
            // console.log('[getAllQuotes] target: next:', url)
            
            const html = await axios.get(url);
            const $    = await cheerio.load(html.data);
            
            $("div.quote").each((i, elem) => {
                data.push(parseQuote(elem, $))
            })
            
            nextLink = $("li.next a").attr("href");
        }
        
        return data;
    }
    
    static async getQuotesByTag(tag) {
        
        const url  = BASE_URL + `/tag/${tag}`
        const html = await axios.get(url);
        
        
        const $ = await cheerio.load(html.data, {}, false);
        
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
        
        
        let nextLink = $("li.next a").attr("href");
        
        while (nextLink) {
            
            const url = BASE_URL + nextLink;
            // console.log('target: next:', url)
            
            const html = await axios.get(url);
            const $    = cheerio.load(html.data, {}, false);
            
            $("div.quote").each((i, elem) => {
                data.push({
                    author: $(elem).find("[itemprop='author']").text().trim(),
                    // author_about: $(elem).find("a").attr('href'),
                    text: $(elem).find("[itemprop='text']").text().slice(0, 50),
                    tags: $(elem).find("meta[itemprop='keywords']").attr('content').split(',')
                })
            })
            
            // nextLink = $("li.next").find("a").attr("href");
            nextLink = $("li.next a").attr("href");
        }
        
        return data;
    }
    
    static async getAuthor(author) {
        
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
        const url   = BASE_URL + `/author/${fixed}/`
        const html  = await axios.get(url);
        const $     = await cheerio.load(html.data);
        
        // console.log('target: ', url)
        
        let data = []
        
        $("div.author-details").each((i, elem) => {
            data.push(parseAuthor(elem))
        })
        
        return (data[0].name === '') ? [] : data;
    }
    
    static async getAllAuthor() {
        
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
        
        let data = []
        
        let promises = []
        
        let axiosArr = []
        
        for (let i = 0; i < list.length; i++) {
            
            let name  = list[i];
            let fixed = fixAuthorName(name);
            let url   = BASE_URL + `/author/${fixed}/`
            
            // console.log('target: ', url)
            
            let ax = getAxiosInstance();
            axiosArr.push(ax)
            
            promises.push(
                ax.get(url).then(html => {
                    
                    // Parse your result with Cheerio or whatever you like
                    const $ = cheerio.load(html.data, {}, false);
                    
                    let elem = $("div.author-details").first()
                    let o    = parseAuthor(elem, $);
                    
                    
                    return o;
                    
                })
            );
        }
        
        return Promise.all(promises)
        
        
        // return data;
        
    }
    
    static async getAllAuthorAlt() {
        
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
        
        let data = []
        
        let promises = []
        
        let axiosArr = []
        
        for (let i = 0; i < list.length; i++) {
            
            let name  = list[i];
            let fixed = fixAuthorName(name);
            let url   = BASE_URL + `/author/${fixed}/`
            
            // console.log('target: ', url)
            
            let ax = getAxiosInstance();
            axiosArr.push(ax)
            
            promises.push(ax.get(url));
        }
        
        return Promise.all(promises)
            .then((htmlArr) => {
                
                let data = []
                
                htmlArr.forEach(html => {
                    
                    
                    // let data = []
                    
                    // Parse your result with Cheerio or whatever you like
                    const $ = cheerio.load(html.data, null, false);
                    
                    let elem = $("div.author-details").first()
                    let o    = parseAuthor(elem, $);
                    
                    // o.url = html.config.url;
                    // data.push(o)
                    // return parseAuthor(elem, $)
                    
                    
                    // return data[0];
                    // return o;
                    data.push(o);
                    
                })
                
                return data;
                
                
            })
            .catch((error) => console.error(error))
        
        
        // return data;
        
    }
    
    
}

const getAxiosInstance = () => {
    const instance = axios.create({
        responseType: 'text',
        baseURL     : BASE_URL,
        timeout     : 10000,
        
        
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept"    : "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            
            "Accept-Encoding": "gzip, deflate, br",
            
            "pragma"                   : "no-cache",
            "cache-control"            : "no-cache",
            "upgrade-insecure-requests": "1",
            "sec-fetch-site"           : "cross-site",
            "sec-fetch-mode"           : "navigate",
            "sec-fetch-user"           : "?1",
            "sec-fetch-dest"           : "document"
        }
    });
    return instance;
}


module.exports = ScrapperService;