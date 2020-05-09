// get exams data from website [http://static.bacalaureat.edu.ro/2018/rapoarte_sept/index.html]

const fs = require('fs-extra');
const glob = require('glob');

// import local modules
const createFolder = require('./modules/create-folder.js');
const getCountiesInfo = require('./modules/get-counties-info.js');
const getExamCentersList = require('./modules/get-exam-centers-list.js');
const getStudentsList = require('./modules/get-students-list.js');

// local paths
const dataPath = './data';
const localPaths = {
  metadata: 'metadata',
  tables: 'tables',
  exports: 'exports',
  logs: 'logs',
};

// remote paths
const mapPathStart = 'http://static.bacalaureat.edu.ro'; // mapPathStart/year/mapPathEnd
const mapPathEnd = 'rapoarte_sept/judete.html';
const hsPathStart = 'http://static.bacalaureat.edu.ro/2018/rapoarte_sept'; // hsPathStart/countyCode/hsPathEnd
const hsPathEnd = 'lista_unitati';
const ecPathStart = 'http://static.bacalaureat.edu.ro/2018/rapoarte_sept'; // ecPathStart/countyCode/ecPathEnd
const ecPathEnd = 'unitati_arondate';
const studentsPath = 'http://static.bacalaureat.edu.ro/2018/rapoarte_sept/rezultate/alfabetic';


// ////////////////////////////////////////////////////////////////////////////
// // METHODS

// /////////////////////////////////////////////////////////////////////
// get current date - formatted
function getCurrentDate() {
  const today = new Date().toISOString();
  const regex = /^(\d{4}-\d{2}-\d{2})/g;
  // return formatted string
  return today.match(regex)[0];
}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN function
async function main() {
  // get current date
  const today = getCurrentDate();
  // create folder paths variables
  const metadataPath = `${dataPath}/${today}/${localPaths['metadata']}`;
  const tablesPath = `${dataPath}/${today}/${localPaths['tables']}`;
  const exportsPath = `${dataPath}/${today}/${localPaths['exports']}`;
  const logsPath = `${dataPath}/${today}/${localPaths['logs']}`;
  // create save files paths variables
  const countiesSavePath = `${metadataPath}/year_counties.json`;
  const ecSavePath = `${metadataPath}/year_exam-centers.json`;
  const studentsSavePath = `${tablesPath}/year_students.json`;

  // help text
  const helpText = `\n Available commands:\n\n\
  1. -h : display help text\n\
  2. -d : download metadata for counties and localities\n\
  3. -e [date]: export JSON files found in tables folder to CSV, for the given date\n`;

  // get command line arguments
  const arguments = process.argv;
  console.log('\x1b[34m%s\x1b[0m', '\n@START: CLI arguments >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  console.table(arguments);
  console.log('\n');

  // get third command line argument
  // if argument is missing, -h is set by default
  const mainArg = process.argv[2] || '-h';
  const yearList = [ 2018, 2019 ];
  // manual select list of counties for download, leave active only the ones you want to download
  const countiesList = [
    // 'ALBA',
    // 'ARAD',
    // 'ARGES',
    // 'BACAU',
    // 'BIHOR',
    // 'BISTRITA-NASAUD',
    // 'BOTOSANI',
    // 'BRAILA',
    // 'BRASOV',
    // 'BUZAU',
    // 'CALARASI',
    // 'CARAS-SEVERIN',
    // 'CLUJ',
    // 'CONSTANTA',
    // 'COVASNA',
    // 'DAMBOVITA',
    // 'DOLJ',
    // 'GALATI',
    // 'GIURGIU',
    // 'GORJ',
    // 'HARGHITA',
    // 'HUNEDOARA',
    // 'IALOMITA',
    // 'IASI',
    // 'ILFOV',
    // 'MARAMURES',
    // 'MEDEDINTI',
    // 'BUCURESTI',
    // 'MURES',
    // 'NEAMT',
    // 'OLT',
    // 'PRAHOVA',
    // 'SALAJ',
    // 'SATU-MARE',
    // 'SIBIU',
    // 'SUCEAVA',
    // 'TELEORMAN',
    // 'TIMIS',
    // 'TULCEA',
    // 'VALCEA',
    // 'VASLUI',
    // 'VRANCEA',
  ];

  // run requested command
  // 1. if argument is 'h' or 'help' print available commands
  if (mainArg === '-h') {
    console.log(helpText);

  // 2. else if argument is 'm'
  } else if (mainArg === '-d') {

    // prepare folders // folders are not written over
    createFolder(1, metadataPath);
    createFolder(2, tablesPath);
    createFolder(3, exportsPath);
    createFolder(4, logsPath);

    // stage 1: get counties info
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('STAGE 1: get counties info\n');
    for(let yearIndex = 0; yearIndex < yearList.length; yearIndex += 1) {
      const currentYear = yearList[yearIndex]; // choose year to retrieve data for
      const mapPath = `${mapPathStart}/${currentYear}/${mapPathEnd}`;
      // console.log(mapPath);
      try {
        const countiesInfo = await getCountiesInfo(mapPath, countiesSavePath.replace('year', `${currentYear}`));
        console.log('>>>> await branch >>>>');

        // stage 2: filter counties, only download data for counties in countiesList
        // if countiesList is empty, download all
        const filteredCounties = {
          href: countiesInfo.href,
          counties: countiesInfo.counties.filter( item => countiesList.length > 0 ? countiesList.includes(item.name) : true ),
          hsHref: {
            hsPathStart,
            hsPathEnd,
          },
          ecHref: {
            ecPathStart,
            ecPathEnd,
          },
          studentsHref: studentsPath,
        }

        // stage 3: get exam centers with assigned high schools
        console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 3: get Exam Centers list\n');
        await getExamCentersList(filteredCounties, ecSavePath.replace('year', `${currentYear}`));

        // stage 4: get students list
        console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 3: get Students list\n');
        await getStudentsList(currentYear, studentsPath, studentsSavePath.replace('year', `${currentYear}`));

      } catch (err) {
        console.error(err);
      }

    }

     // 3. else if argument is 'd'
  } else if (mainArg === '-e') {

    // stage 3: get localities DATA
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('STAGE 3: export JSON data to CSV\n');
    // // read localities metadata file
    // const localitiesInfo = require(`${metadataPath}/localities.json`);
    // // download data
    // await getLocalitiesData(localitiesInfo);

    // else print help
  } else {
    console.log(helpText);
  }

}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN
main();
