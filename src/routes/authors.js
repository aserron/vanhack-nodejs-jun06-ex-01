const express = require('express');
const scrap   = require('../services/scrapper')

const router = express.Router();

router.use(async function (req, res, next) {
    
    let scache = scrap.instance.cache();
    
    // quotes = quotes || await scrap.getAllQuotesConcurrent()
    if (!scache.has('authors')) {
        let data = await scrap.getAllAuthor()
        scache.set('authors', data)
    }
    
    console.log(
        'Request URL:', req.originalUrl,
        ` created=${req.app.created.getTime()}`)
    // console.log(scache)
    next()
    
}, function (req, res, next) {
    console.log('Request Type:', req.method)
    console.log()
    next()
})

/* GET users listing. */
router.get('/', async function (req, res, next) {
    
    const {name} = req.query;
    
    let results
    
    
    let scache = scrap.instance.cache();
    let authors = scache.get('authors')
    
    if (authors) {
        
        results = (name === undefined) ?
            authors :
            authors.filter((quote) => (quote.name === (name)))
        
    } else {
    
        try {
            
            results = (name !== undefined) ?
                await scrap.getAuthor(name) :
                await scrap.getAllAuthor()
        
        } catch (e) {
            console.log("[Error]", e)
            next()
        }
    }
    
    res.status(200)
        .json({data: results})
    
    
});

router.get('/alt', async function (req, res, next) {
    
    
    const {name} = req.query;
    
    let results
    
    
    let scache = scrap.instance.cache();
    let quotes = scache.get('quotes')
    
    if (authors) {
        
        results = (tag === undefined) ?
            quotes :
            quotes.filter((quote) => (quote.tags.includes(tag)))
    
    } else {
        
        try {
            results = await scrap.getAllAuthorAlt()
            
        } catch (e) {
            console.log("[Error]", e)
            next()
        }
    }
    
    res.status(200).json({data: results})
    
    
});


module.exports = router;
