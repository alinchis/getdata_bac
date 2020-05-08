// get metadata from BAC server and save it in JSON files

// import libraries
const fs = require('fs-extra');
const axios = require('axios');
const cheerio = require('cheerio');


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// download subsequent html pages
async function getHtmlPages(countyIndex, county, reqPath, maxPages, hpArr) {
    console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Download High Schools additional HTML pages`);
    for(let i = 2; i <= maxPages; i += 1) {
        // get data from website
        try {
            // create page request path
            const nReqPath = `${reqPath}/page_${i}.html`;
            // get first page data
            const response = await axios.get(nReqPath);
            console.log(`${countyIndex}::${county.code}: GET html page ${i} >>> ${response.status}`);
            if(response.status === 200) {
                hpArr.push(response.data);
            } else {
                throw `${countyIndex}::${county.code}: ERROR retrieving high schools ${i} page!`;
            }
        } catch(err) {
            console.error(err);
        }
    }
}

// /////////////////////////////////////////////////////////////////////
// process HTML pages and return array of High Schools
function processHtml(page, pIndex) {
    console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Process High Schools HTML pages`);
    // create return array
    const returnArr = [];
    // load data in cheerio object
    const $ = cheerio.load(page);

    // select all 'tables' elements
    const tablesArray = $('body')
        .children().first()
        .children().first()
        .children().first()
        .children();

    // get the high schools table
    const dataTable = tablesArray
        .children().eq(5)  // get the <table> element
        .children().first();  // get the <tr> elements
    // console.log(dataTable.html());
    dataTable.children().each((i, row) => {
        if(i > 0) {
            // get high school item index
            const itemIndex = $(row).children().first().html().replace('&#xA0;', '');
            // console.log(itemIndex);
            // get HS name
            const itemName = $(row).children().eq(1)
                .children().first()
                .children().first()
                .children().first()
                .text().replace('&#xA0;', '').trim();
            // console.log(itemName);
            // get HS href exams list href
            const itemExamListHref = $(row).children().eq(1)
                .children().first()
                .children().first()
                .children().eq(1)
                .children().eq(0)
                .children().first()
                .attr('href');
            // console.log(itemExamListHref);
            // get HS href exams partial results href
            const itemExamPartialResultsHref = $(row).children().eq(1)
                .children().first()
                .children().first()
                .children().eq(1)
                .children().eq(1)
                .children().first()
                .attr('href');
            // console.log(itemExamPartialResultsHref);
            // get HS href exams final results href ordered by name asc
            const itemExamFinalResultsNameHref = $(row).children().eq(1)
                .children().first()
                .children().first()
                .children().eq(1)
                .children().eq(2)
                .children().first()
                .attr('href');
            // console.log(itemExamFinalResultsNameHref);
            // get HS href exams final results href, ordered by score
            const itemExamFinalResultsScoreHref = $(row).children().eq(1)
                .children().first()
                .children().first()
                .children().eq(1)
                .children().eq(3)
                .children().first()
                .attr('href');
            // console.log(itemExamFinalResultsScoreHref);
            // get HS item locality
            const itemLocality = $(row).children().eq(2).html().replace('&#xA0;', '');
            // console.log(itemLocality);
            // get HS item review center
            const itemReviewCenter = $(row).children().eq(3).html()
                .replace(/&#xA0;/g, '')
                .replace(/&quot;/g, '"');
            // console.log(itemReviewCenter);

            // return new item
            returnArr.push({
                index: itemIndex,
                denumire: itemName,
                localitate: itemLocality,
                centruExaminare: itemReviewCenter,
                listaProbeHref: itemExamListHref,
                rezultatePartialeHref: itemExamPartialResultsHref,
                rezultateFinaleAlfabetic: itemExamFinalResultsNameHref,
                rezultateFinaleMedie: itemExamFinalResultsScoreHref,
            })
        }
    });
    // return data
    return returnArr;
}

// /////////////////////////////////////////////////////////////////////
// extract counties data
async function extractData(countyIndex, county, reqPath, htmlData) {
    console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Download & Process High Schools first HTML page`);
    // load data in cheerio object
    const $ = cheerio.load(htmlData);
    // select all 'tables' elements
    const tablesArray = $('body')
        .children().first()
        .children().first()
        .children().first()
        .children();
    // console.log(tablesArray);
    // create new array to hold counties info
    let returnArr = [];
    // if retrieval is successful
    if (tablesArray && tablesArray.length > 0) {
        console.log(`${countyIndex}::${county}: ${tablesArray.length} high schools arr retrieved`);
        // there are 3 tables:
        // 1. main navigation and info, we need to get the date of last update
        const lastUpdate = tablesArray.children().eq(0)
            .children().first() // <tr>
            .children().first() // <td>
            .children().eq(2).html() // third /last <td> element
            .replace('Data ultimei actualiz&#x103;ri: ', '') // delete preceding text
            .replace('&#xA0;', ' ')   // replace character separating date and time
            .replace('&#xA0;', '');   // delete the last character, after time
        console.log(`${countyIndex}::${county.code}: Last update = ${lastUpdate}`);

        // 2. current navigation, we need to get the number of available pages
        const maxPages = $('SELECT').children().last().attr('value'); // get last <option value=max> child from the <select> parent element
        console.log(`${countyIndex}::${county.code}: Number of High Schools pages = ${maxPages}`);

        // 3.0. get an array of pages
        const pagesArr = [];
        // push first page into array
        pagesArr.push(htmlData);
        // if max no of pages > 1 get the rest of the pages
        if (maxPages > 1) {
            try {
                await getHtmlPages(countyIndex, county, reqPath, maxPages, pagesArr);
            } catch (e) {
                console.error(e);
            }
        }

        // 3.1. process all html pages and get all the data tables
        // we need to get high schools data, the third <table> in each page
        for(let pIndex = 0; pIndex < pagesArr.length; pIndex += 1) {
            returnArr.push(processHtml(pagesArr[pIndex], pIndex));
        }

        // console.log(hsList);

    } else {
        throw `${countyIndex}::${county.code}: ERROR retrieving high schools first page!`;
    }
    // return the new array
    return returnArr.flat();
}

// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = (countiesObj, saveFile) => {
    console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Download High Schools info`);

    // for each item in counties array
    countiesObj.counties.map(async (county, ctyIndex) => {
       // get data from website
       try {
           // create first page request path
           const reqPath = `${countiesObj.hsHref.hsPathStart}/${county.code}/${countiesObj.hsHref.hsPathEnd}`;
           // get data
           const response = await axios.get(reqPath);
           try {
               const hsArray = await extractData(ctyIndex, county, reqPath, response.data)
               // save data to file
               fs.writeFileSync(saveFile, `${JSON.stringify(hsArray)}`, 'utf8', () => console.log(`@BAC::File ${saveFile} closed!`));
               console.log('@BAC:: High Schools Info file write Done!');
           } catch(err) {
               console.error(err);
           }

       } catch(err) {
           console.error(err);
       }
    });
}
