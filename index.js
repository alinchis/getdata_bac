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
  const logsPath = `${dataPath}/${today}/${localPaths['logs']}`;
  // create save files paths variables
  const countiesSavePath = `${metadataPath}/counties.json`;
  const ecSavePath = `${metadataPath}/exam-centers.json`;
  const studentsSavePath = `${dataPath}/students.json`;

  // help text
  const helpText = `\n Available commands:\n\n\
  1. -h : display help text\n\
  2. -m : download metadata for counties and localities\n\
  3. -d : download data for each locality\n`;

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
  } else if (mainArg === '-m') {

    // prepare folders // folders are not written over
    createFolder(1, metadataPath);
    createFolder(2, tablesPath);
    createFolder(3, logsPath);

    // stage 1: get counties info
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('STAGE 1: get counties info\n');
    const mapPath = `${mapPathStart}/${yearList[0]}/${mapPathEnd}`;
    // console.log(mapPath);
    try {
      // const countiesInfo = await getCountiesInfo(mapPath, countiesSavePath);
      // console.log('>>>> await branch >>>>');
      //
      // // stage 2: filter counties, only download data for counties in countiesList
      // // if countiesList is empty, download all
      // const filteredCounties = {
      //   href: countiesInfo.href,
      //   counties: countiesInfo.counties.filter( item => countiesList.length > 0 ? countiesList.includes(item.name) : true ),
      //   hsHref: {
      //     hsPathStart,
      //     hsPathEnd,
      //   },
      //   ecHref: {
      //     ecPathStart,
      //     ecPathEnd,
      //   },
      //   studentsHref: studentsPath,
      // }

      // stage 3: get exam centers with assigned high schools
      console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.log('STAGE 3: get Exam Centers list\n');
      // await getExamCentersList(filteredCounties, ecSavePath);

      // stage 4: get students list
      console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      console.log('STAGE 3: get Students list\n');
      await getStudentsList(studentsPath, studentsSavePath);

    } catch (err) {
      console.error(err);
    }

     // 3. else if argument is 'd'
  } else if (mainArg === '-d') {

    // stage 3: get localities DATA
    console.log('\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('STAGE 3: get localities data\n');
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
