// get metadata from BAC server and save it in JSON files

// import libraries
const fs = require('fs-extra');
const axios = require('axios');
const cheerio = require('cheerio');


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// download subsequent html pages
async function getHtmlPages(year, month, reqPath, maxPages, saveArr, logFile) {
    console.log('\x1b[34m%s\x1b[0m', `${year}-${month}:: RO PROGRESS: Download Students additional HTML pages`);
    for(let i = 2; i <= maxPages; i += 1) { //maxPages
        // get data from website
        try {
            let responseOk = false;
            do {
                // create page request path
                const nReqPath = `${reqPath}/page_${i}.html`;
                // get data
                const response = await axios.get(nReqPath);
                console.log(`${year}-${month}:: RO GET html page ${i}/${maxPages} >>> ${response.status}`);
                if(response.status === 200) {
                    responseOk = true;
                    fs.appendFileSync(logFile, `${nReqPath},${response.status}\n`);
                    saveArr.push(response.data);
                } else {
                    fs.appendFileSync(logFile, `${nReqPath},${response.status}\n`);
                    throw `${year}-${month}:: ERROR retrieving Students List #${i} page!`;
                }
            } while (!responseOk)

        } catch(err) {
            console.error(err);
        }
    }
    // return data
    return saveArr;
}


// /////////////////////////////////////////////////////////////////////
// process HTML pages and return array of High Schools
function processHtml(year, month, reqPath, lastUpdate, page, pIndex) {
    try {
        console.log(`\n${year}-${month}:: RO processHtml START(${pIndex}) 222222222222222222222`);
        console.log('\x1b[34m%s\x1b[0m', `RO PROGRESS: Process Exam Centers HTML pages`);
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
        // console.log(tablesArray);

        // get the high schools table
        const dataTable = tablesArray
            .children().eq(5)  // get the <table> element
            .children().first();  // get the <tr> elements
        // console.log(dataTable);
        const returnArr = [];
        dataTable.children().each((i, row) => {
            if(i > 1 && i % 2 === 0) {
                // get script text
                const regexSearch = /=\"([^"]*)\"\;/g;
                const scriptMatch = $(row).children().eq(0).html()
                    .match(regexSearch)
                    .map(item => item.replace('="', '').replace('";', '').replace('<br>', '').trim());
                console.log(scriptMatch);
                // student full name
                const stFullName = scriptMatch[0];
                // student mean grade
                const stMeanGrade = scriptMatch[1];
                // student final result
                const stFinalResult = scriptMatch[2];
                // get Student item index
                const stIndex = $(row).children().eq(1).html().replace(/&#xA0;/g, '');
                console.log(`${stIndex}\n`);
                // get Student name
                const stName = $(row)
                    .attr('hint').replace(/&#xA0;/g, '');
                // console.log(stName);
                // get Student place in County
                const stCountyNo = $(row).children().eq(3)
                    .children().first().html();
                // console.log(stCountyNo);
                // get Student place in Country
                const stCountryNo = $(row).children().eq(4)
                    .children().first().html();
                // console.log(stCountryNo);
                // get Student School Name
                const stSchoolName = $(row).children().eq(5)
                    .children().first().html()
                    .replace(/&#xA0;/g, '')
                    .replace(/\s+/g, ' ')
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, '"')
                    .replace(/&#xE2;&#x20AC;&#x2122;/g, '"')
                    .replace(/&#xE2;&#x20AC;&#x17E;/g, '"')
                    .replace(/&#xC3;&#xA1;/g, 'Á')
                    .replace(/&#xC3;&#xA9;/g, 'É')
                    .replace(/&#xC3;&#xB6;/g, 'Ö')
                    .replace(/&#xC3;&#xB3;/g, 'Ó')
                    .replace(/&#xC5;&#x2018;/g, 'Ő')
                    .trim();
                // console.log(stSchoolName);
                // get Student School County
                const stSchoolCounty = $(row).children().eq(6)
                    .children().first().html().replace(/&#xA0;/g, '').trim();
                // console.log(stSchoolCounty);
                // get Student former graduate
                const stFormerGraduate = $(row).children().eq(7).html().replace(/&#xA0;/g, '').trim();
                // console.log(stFormerGraduate);
                // get Student study type
                const stStudyType = $(row).children().eq(8).html().replace(/&#xA0;/g, '').trim();
                // console.log(stStudyType);
                // get Student specialty
                const stSpecialty = $(row).children().eq(9).html().replace(/&#xA0;/g, '').trim();
                // console.log(stSpecialty);
                // get Student romanian competency
                const stLLRCompetency = $(row).children().eq(10).html().replace(/&#xA0;/g, '').trim();
                // console.log(stLLRCompetency);
                // get Student romanian grade
                const stLLRWrite = $(row).children().eq(11).html().replace(/&#xA0;/g, '').trim();
                // console.log(stLLRWrite);
                // get Student romanian challenge
                const stLLRChallenge = $(row).children().eq(12).html().replace(/&#xA0;/g, '').trim();
                // console.log(stLLRChallenge);
                // get Student romanian final grade
                const stLLRFinalGrade = $(row).children().eq(13).html().replace(/&#xA0;/g, '').trim();
                // console.log(stLLRFinalGrade);
                // get Student mother tongue
                const stMT = $(row).children().eq(14).html().replace(/&#xA0;/g, '').trim();
                // console.log(stMT);
                // get Student mother tongue competency
                const stMTCompetency = $(row).next().children().eq(0).html().replace(/&#xA0;/g, '').trim();
                // console.log(stMTCompetency);
                // get Student mother tongue competency
                const stMTWrite = $(row).next().children().eq(1).html().replace(/&#xA0;/g, '').trim();
                // console.log(stMTWrite);
                // get Student mother tongue competency
                const stMTChallenge = $(row).next().children().eq(2).html().replace(/&#xA0;/g, '').trim();
                // console.log(stMTChallenge);
                // get Student mother tongue competency
                const stMTFinalGrade = $(row).next().children().eq(3).html().replace(/&#xA0;/g, '').trim();
                // console.log(stMTFinalGrade);
                // get Student modern language
                const stModernLanguage = $(row).children().eq(15).html().replace(/&#xA0;/g, '').trim();
                // console.log(stModernLanguage);
                // get Student modern language grade
                const stModernLanguageGrade = $(row).children().eq(16).html().replace(/&#xA0;/g, '').trim();
                // console.log(stModernLanguageGrade);
                // get Student compulsory discipline
                const stCompDsc = $(row).children().eq(17).html().replace(/&#xA0;/g, '').trim();
                // console.log(stCompDsc);
                // get Student compulsory discipline Grade
                const stCompDscGrade = $(row).next().children().eq(4).html().replace(/&#xA0;/g, '').trim();
                // console.log(stCompDscGrade);
                // get Student compulsory discipline Challenge
                const stCompDscChallenge = $(row).next().children().eq(5).html().replace(/&#xA0;/g, '').trim();
                // console.log(stCompDscChallenge);
                // get Student compulsory discipline Final Grade
                const stCompDscFinalGrade = $(row).next().children().eq(6).html().replace(/&#xA0;/g, '').trim();
                // console.log(stCompDscFinalGrade);
                // get Student by choice discipline
                const stChoiceDsc = $(row).children().eq(18).html().replace(/&#xA0;/g, '').trim();
                // console.log(stChoiceDsc);
                // get Student by choice discipline Grade
                const stChoiceDscGrade = $(row).next().children().eq(7).html().replace(/&#xA0;/g, '').trim();
                // console.log(stChoiceDscGrade);
                // get Student by choice discipline Challenge
                const stChoiceDscChallenge = $(row).next().children().eq(8).html().replace(/&#xA0;/g, '').trim();
                // console.log(stChoiceDscChallenge);
                // get Student by choice discipline Final Grade
                const stChoiceDscFinalGrade = $(row).next().children().eq(9).html().replace(/&#xA0;/g, '').trim();
                // console.log(stChoiceDscFinalGrade);
                // get Student digital level
                const stDigitalLevel = $(row).children().eq(19).html().replace(/&#xA0;/g, '').trim();
                // console.log(stDigitalLevel);

                // return new item
                returnArr.push({
                    an: year,
                    index: stIndex,
                    nume: stName,
                    numeLung: stFullName,
                    pozitiePeJudet: stCountyNo,
                    pozitiePeTara: stCountryNo,
                    unitateInvatamant: stSchoolName,
                    unitateJudet: stSchoolCounty,
                    promotieAnterioara: stFormerGraduate,
                    formaInvatamant: stStudyType,
                    specializare: stSpecialty,
                    llrCompetente: stLLRCompetency,
                    llrScris: stLLRWrite,
                    llrContestatie: stLLRChallenge,
                    llrNotaFinala: stLLRFinalGrade,
                    llm: stMT,
                    llmCompetente: stMTCompetency,
                    llmScris: stMTWrite,
                    llmContestatie: stMTChallenge,
                    llmNotaFinala: stMTFinalGrade,
                    lm: stModernLanguage,
                    lmNota: stModernLanguageGrade,
                    do: stCompDsc,
                    doNota: stCompDscGrade,
                    doContestatie: stCompDscChallenge,
                    doNotaFinala: stCompDscFinalGrade,
                    da: stChoiceDsc,
                    daNota: stChoiceDscGrade,
                    daContestatie: stChoiceDscChallenge,
                    daNotaFinala: stChoiceDscFinalGrade,
                    competenteDigitale: stDigitalLevel,
                    media: stMeanGrade,
                    rezultatFinal: stFinalResult,
                });
            }
        });

        // return data
        console.log(`RO processHtml END(${pIndex}) 222222222222222222222`);
        return returnArr;

    } catch (e) {
        console.error(e);
    }
}


// /////////////////////////////////////////////////////////////////////
// Download & Process Exams Centers
async function extractData(year, month, reqPath, htmlData, logFile) {
    console.log(`\n${year}-${month}:: RO @extractData START 111111111111111111111`);
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
        console.log(`${year}-${month}:: RO ${tablesArray.length} Students arr retrieved`);
        // there are 3 tables:
        // 1. main navigation and info, we need to get the date of last update
        lastUpdate = tablesArray.children().eq(0)
            .children().first() // <tr>
            .children().first() // <td>
            .children().eq(2).html() // third /last <td> element
            .replace('Data ultimei actualiz&#x103;ri: ', '') // delete preceding text
            .replace('&#xA0;', ' ')   // replace character separating date and time
            .replace('&#xA0;', '');   // delete the last character, after time
        console.log(`RO Last update = ${lastUpdate}`);

        // 2. current navigation, we need to get the number of available pages
        maxPages = $('SELECT').children().last().attr('value'); // get last <option value=max> child from the <select> parent element
        console.log(`${year}-${month}:: RO Number of Exam Centers pages = ${maxPages}`);

        // 3.0. get an array of pages
        const pagesArr = [];
        // push first page into array
        pagesArr.push(htmlData);
        // if max no of pages > 1 get the rest of the pages
        if (maxPages > 1) {
            try {
                console.log(`${year}-${month}:: RO @extractData:: maxPages > 1 : try branch start`);
                await getHtmlPages(year, month, reqPath, maxPages, pagesArr, logFile);
            } catch (e) {
                console.error(e);
            }
        }

        // 3.1. process all html pages and get all the data tables
        // we need to get Students list, the third <table> in each page
        for(let pIndex = 0; pIndex < pagesArr.length; pIndex += 1) {
            console.log(`${year}-${month}:: RO @extractData >>> get all Students pages | for loop #${pIndex}`);
            returnArr.push(...processHtml(year, month, reqPath, lastUpdate, pagesArr[pIndex], pIndex));
        }

    } else {
        throw `ERROR retrieving Students list first page!`;
    }
    // return the new array
    console.log(`@extractData END 111111111111111111111`);
    // console.log(returnArr)
    return returnArr;
}

// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = async (year, month, firstPagePath, saveFile, logFile) => {
    try {
        console.log('\x1b[34m%s\x1b[0m', `\n\n${year}-${month}:: RO @BAC PROGRESS: Download Students list`);

        // start log file
        const logHeaderArr = [ 'request_path', 'response_status' ];
        fs.writeFileSync(logFile, `${logHeaderArr.join(',')}\n`);

        // get data
        let responseFirstPage = '';
        let firstPageOk = false;
        do {
            responseFirstPage = await axios.get(firstPagePath);
            if(responseFirstPage.status === 200) {
                fs.appendFileSync(logFile, `${firstPagePath},${responseFirstPage.status}\n`);
                firstPageOk = true;
            } else {
                fs.appendFileSync(logFile, `${firstPagePath},${responseFirstPage.status}\n`);
                throw `${year}-${month}:: RO ERROR retrieving Students List FIRST page!`;
            }
        } while (!firstPageOk);

        // get data
        // const response = await axios.get(firstPagePath);
        console.log(`${year}-${month}:: RO GET first page status = ${responseFirstPage.status}`);
        const studentsArr =  await extractData(year, month, firstPagePath, responseFirstPage.data, logFile);

        console.log(`${year}:: RO extractData done !!!!!!!!!!!!!!!!!!!!!!!!!!!`);
        // save data to file
        fs.writeFileSync(saveFile, `${JSON.stringify(studentsArr)}`, 'utf8', () => console.log(`${year}:: RO @BAC::File ${saveFile} closed!`));
        console.log(`${year}-${month}:: RO @BAC:: Students list file write Done!`);
    } catch(err) {
        console.error(err);
    }

}
