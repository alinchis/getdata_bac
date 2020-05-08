// get metadata from BAC server and save it in JSON files

// import libraries
const fs = require('fs-extra');
const axios = require('axios');
const cheerio = require('cheerio');


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// download subsequent html pages
async function getHtmlPages(countyIndex, county, reqPath, maxPages, saveArr) {
    console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Download Exam Centers additional HTML pages`);
    for(let i = 2; i <= maxPages; i += 1) {
        // get data from website
        try {
            // create page request path
            const nReqPath = `${reqPath}/page_${i}.html`;
            // get first page data
            const response = await axios.get(nReqPath);
            console.log(`${countyIndex}::${county.code}: GET html page ${i} >>> ${response.status}`);
            if(response.status === 200) {
                saveArr.push(response.data);
            } else {
                throw `${countyIndex}::${county.code}: ERROR retrieving Exams Centers ${i} page!`;
            }
        } catch(err) {
            console.error(err);
        }
    }
    // return data
    return saveArr;
}

// /////////////////////////////////////////////////////////////////////
// download high schools list
async function getHsArr(countyIndex, county, ecItem, ecIndex) {
    console.log(`getHsArr START(${countyIndex}) 333333333333333333333`);
    const returnArr = [];

    try {
        // get data
        // get first page
        console.log(ecItem.listaLiceeHref);
        const firstPage = await axios.get(ecItem.listaLiceeHref);
        // load data in cheerio object
        const $ = cheerio.load(firstPage.data);
        // get the number of available pages
        const maxPages = $('SELECT').children().last().attr('value'); // get last <option value=max> child from the <select> parent element
        console.log(`${countyIndex}::${county.code}: Number of EC HS pages = ${maxPages}`);
        // create an array of html pages
        const pagesArr = [];
        // push first page into array
        pagesArr.push(firstPage.data);
        // if max no of pages > 1 get the rest of the pages
        if(maxPages > 1) {
            try {
                await getHtmlPages(countyIndex, county, ecItem.listaLiceeHref.replace('/index.html', ''), maxPages, pagesArr);
            } catch (e) {
                console.error(e);
            }
        }

        // process all html pages and get all the data tables
        for(let pIndex = 0; pIndex < pagesArr.length; pIndex += 1) {
            console.log(`Process HS html page ${pIndex}`);
            returnArr.push(processHsHtml(pagesArr[pIndex], pIndex));
        }

    } catch(err) {
        console.error(err);
    }

    // return data
    console.log(`getHsArr END(${countyIndex}) 333333333333333333333`);
    ecItem.listaLicee = returnArr.flat();
    return ecItem;
}

// /////////////////////////////////////////////////////////////////////
// process HS html pages
function processHsHtml(pageHtml, pageIndex) {
    console.log(`processHsHtml START(${pageIndex}) 4444444444444444444444`);
    // console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Process Exam Centers High Schools HTML page ${pageIndex}`);
    // create return array
    const returnArr = [];
    // load data in cheerio object
    // console.log(pageHtml);
    const $ = cheerio.load(pageHtml);

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
            // get HS item index
            const itemIndex = $(row).children().first().html().replace('&#xA0;', '');
            // console.log(itemIndex);
            // get HS name
            const itemName = $(row).children().eq(1)
                .html().replace(/&#xA0;/g, '')
                .replace(/&quot;/g, '"').trim();
            // console.log(itemName);
            // get HS SIRUES code
            const itemCode = $(row).children().eq(2)
                .html().replace(/&#xA0;/g, '').trim();
            // console.log(itemCode);
            // get HS locality
            const itemLocality = $(row).children().eq(3)
                .html().replace(/&#xA0;/g, '').trim();
            // console.log(itemLocality);

            // return new item
            returnArr.push({
                index: itemIndex,
                denumire: itemName,
                codSirues: itemCode,
                localitate: itemLocality,
            })
        }
    });
    // return data
    console.log(`processHsHtml END(${pageIndex}) 4444444444444444444444`);
    return returnArr;
}

// /////////////////////////////////////////////////////////////////////
// process HTML pages and return array of High Schools
function processHtml(countyIndex, county, reqPath, lastUpdate, page, pIndex) {
    try {
        console.log(`processHtml START(${pIndex}) 222222222222222222222`);
        console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Process Exam Centers HTML pages`);
        // create return array
        // const returnArr = [];
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
        const returnArr = [];
        dataTable.children().each((i, row) => {
            if(i > 0) {
                // get Exam Center item index
                const itemIndex = $(row).children().first().html().replace('&#xA0;', '');
                console.log(itemIndex);
                // get Exam Center name
                const itemName = $(row).children().eq(1)
                    .html().replace(/&#xA0;/g, '')
                    .replace(/&quot;/g, '"').trim();
                // console.log(itemName);
                // get Exam Center SIRUES code
                const itemCode = $(row).children().eq(2)
                    .html().replace(/&#xA0;/g, '').trim();
                // console.log(itemCode);
                // get Exam Center locality
                const itemLocality = $(row).children().eq(3)
                    .html().replace(/&#xA0;/g, '').trim();
                // console.log(itemLocality);
                // get Exam Center High Schools list href
                const itemHSHref = $(row).children().eq(4)
                    .children().first()
                    .attr('href');
                // console.log(itemHSHref);
                // get Exam Center High Schools list href
                const itemSubComissions = $(row).children().eq(5)
                    .html().replace(/&#xA0;/g, '').trim();
                // console.log(itemSubComissions);

                // return new item
                returnArr.push({
                    index: itemIndex,
                    denumire: itemName,
                    codSirues: itemCode,
                    localitate: itemLocality,
                    judet_cod: county.code,
                    judet_nume: county.name,
                    ultima_actualizare: lastUpdate,
                    subcomisii: itemSubComissions,
                    listaLiceeHref: `${reqPath}/${itemHSHref}`,
                });
            }
        });

        // return data
        console.log(`processHtml END(${pIndex}) 222222222222222222222`);
        return returnArr;

    } catch (e) {
        console.error(e);
    }
}

// /////////////////////////////////////////////////////////////////////
// Download & Process Exams Centers
async function extractData(countyIndex, county, reqPath, htmlData) {
    console.log(`@extractData START(${countyIndex}) 111111111111111111111`);
    // console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Download & Process Exams Centers first HTML page`);
    // load data in cheerio object
    const $ = cheerio.load(htmlData);
    // select all 'tables' elements
    const tablesArray = $('body')
        .children().first()
        .children().first()
        .children().first()
        .children();
    // console.log(tablesArray);

    let maxPages = 1;
    let lastUpdate = '';
    let returnArr = [];

    // if retrieval is successful
    if (tablesArray && tablesArray.length > 0) {
        console.log(`${countyIndex}::${county.code}: ${tablesArray.length} Exams Centers arr retrieved`);
        // there are 3 tables:
        // 1. main navigation and info, we need to get the date of last update
        lastUpdate = tablesArray.children().eq(0)
            .children().first() // <tr>
            .children().first() // <td>
            .children().eq(2).html() // third /last <td> element
            .replace('Data ultimei actualiz&#x103;ri: ', '') // delete preceding text
            .replace('&#xA0;', ' ')   // replace character separating date and time
            .replace('&#xA0;', '');   // delete the last character, after time
        console.log(`${countyIndex}::${county.code}: Last update = ${lastUpdate}`);

        // 2. current navigation, we need to get the number of available pages
        maxPages = $('SELECT').children().last().attr('value'); // get last <option value=max> child from the <select> parent element
        console.log(`${countyIndex}::${county.code}: Number of Exam Centers pages = ${maxPages}`);

        // 3.0. get an array of pages
        const pagesArr = [];
        // push first page into array
        pagesArr.push(htmlData);
        // if max no of pages > 1 get the rest of the pages
        if (maxPages > 1) {
            try {
                console.log('@extractData:: maxPages > 1 : try branch start');
                await getHtmlPages(countyIndex, county, reqPath, maxPages, pagesArr);
                console.log('@extractData:: maxPages > 1 : try branch end');
            } catch (e) {
                console.error(e);
            }
        }

        // 3.1. process all html pages and get all the data tables
        const ecArr = [];
        // we need to get Exams Centers, the third <table> in each page
        for(let pIndex = 0; pIndex < pagesArr.length; pIndex += 1) {
            console.log(`${countyIndex}::${county.code}: @extractData >>> get all EC pages for loop #${pIndex}`);
            ecArr.push(...processHtml(countyIndex, county, reqPath, lastUpdate, [pIndex], pIndex));
        }

        // 4. for each Exams Center get all High Schools
        returnArr = await Promise.all(ecArr.map((ecItem, ecIndex) => {
            console.log(ecItem.denumire);
            console.log(`${countyIndex}::${county.code}: : @extractData >>> get all HS pages for loop #${ecIndex}`);
            return getHsArr(countyIndex, county, ecItem, ecIndex);
        }));

    } else {
        throw `${countyIndex}::${county.code}: ERROR retrieving Exams Centers first page!`;
    }
    // return the new array
    console.log(`@extractData END(${countyIndex}) 111111111111111111111`);
    // console.log(returnArr)
    return returnArr;
}

// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = async (countiesObj, saveFile) => {
    try {
        console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Download Exams Centers info`);

        // for each item in counties array
        const ecArray = await Promise.all(countiesObj.counties.map(async (county, ctyIndex) => {
            // get data from website
            // create first page request path
            const reqPath = `${countiesObj.ecHref.ecPathStart}/${county.code}/${countiesObj.ecHref.ecPathEnd}`;

            // get data
            const response = await axios.get(reqPath);
            console.log(`${ctyIndex}::${county.code}: GET first page status = ${response.status}`);
            return extractData(ctyIndex, county, reqPath, response.data)
        }));

        console.log('extractData done !!!!!!!!!!!!!!!!!!!!!!!!!!!');
        // save data to file
        fs.writeFileSync(saveFile, `${JSON.stringify(ecArray.flat())}`, 'utf8', () => console.log(`@BAC::File ${saveFile} closed!`));
        console.log('@BAC:: Exams Centers Info file write Done!');
    } catch(err) {
        console.error(err);
    }

}
