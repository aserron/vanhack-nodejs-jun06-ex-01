const express = require('express');
const scrap   = require('../services/scrapper')

const router  = express.Router();

router.use(async function (req, res, next) {
    
    let scache = scrap.instance.cache();
    
    // quotes = quotes || await scrap.getAllQuotesConcurrent()
    if(!scache.has('quotes')){
        let data = await scrap.getAllQuotesConcurrent()
        scache.set('quotes',data)
    }
    
    console.log('Request URL:', req.originalUrl,` created=${req.app.created.getTime()}`)
    // console.log(scache)
    next()
}, function (req, res, next) {
    console.log('Request Type:', req.method)
    console.log()
    next()
})



/* GET users listing. */
router.get('/',async function (req, res, next) {
    
    let scache = scrap.instance.cache();
    let quotes = scache.get('quotes')
    
    const {tag} = req.query;
    
    let results;
    
    if(quotes){
    
        results = (tag === undefined) ?
            quotes :
            quotes.filter((quote)=> (quote.tags.includes(tag)))
            // await scrap.getQuotesByTag(tag)
    } else {
        results = (tag === undefined) ?
            await scrap.getAllQuotesConcurrent() :
            await scrap.getQuotesByTag(tag)
    }
    
    res.status(200).json({'data':results})
});

module.exports = router;
