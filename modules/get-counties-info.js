// get metadata from CNAS server and save it in JSON files

// import libraries
const fs = require('fs-extra');
const axios = require('axios');
const cheerio = require('cheerio');


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// extract counties data
function extractData(htmlData) {
	//   // remove unnecessary '\n' characters & load html
	console.log('extract data ####################');
	const $ = cheerio.load(htmlData.replace(/\\n/g, ''));
	// select all 'area' elements
	const areaArray = $('area');
	// create new array to hold counties info
	const returnArr = [];
	// if retrieval is successful
	if (areaArray && areaArray.length > 0) {
		console.log(`We have retrieved ${areaArray.length} county items`);
		// for each item in list
		$(areaArray).each((i, item) => {
			const itemHref = $(item).attr('href');
			const itemCode = itemHref.substring(0, 2).replace('/', '');
			const itemTitle = $(item).attr('title');
			const itemName = itemTitle.replace('Rapoarte ', '');
			console.log(`${i}:: ${itemTitle}`);
			returnArr.push({
				code: itemCode,
				title: itemTitle,
				name: itemName,
				href: itemHref,
			})
		});
	} else {
		throw "ERROR retrieving counties info!";
	}
	// return the new array
	return returnArr;
}

// /////////////////////////////////////////////////////////////////////////////
// // EXPORTS
module.exports = async (countiesPath, saveFile) => {
	console.log('\x1b[34m%s\x1b[0m', `PROGRESS: Download Counties info`);
	console.log(countiesPath);

	// declare variables
	const countiesList = { counties: [] };
	// get counties info in HTML format
	try {
		const response = await axios.get(countiesPath)
		// console.log(response.data);
		const countiesArr = extractData(response.data);
		console.log(`Found ${countiesArr.length} unique county items.`);
		// write json to file
		const returnObj = {
			href: countiesPath,
			counties: countiesArr,
		};
		// write json to file
		fs.writeFileSync(saveFile, `${JSON.stringify(returnObj)}`, 'utf8', () => console.log(`@CNAS::File ${saveFile} closed!`));
		console.log('@CNAS:: Counties Info file write Done');
		// return the object
		return returnObj;

	} catch (err) {
		console.error(err)
	}
}