// get exams data from website [http://static.bacalaureat.edu.ro/2018/rapoarte_sept/index.html]

const fs = require('fs-extra');
const glob = require('glob');

// import local modules
const createFolder = require('./modules/create-folder.js');
const getCountiesInfo = require('./modules/get-counties-info.js');
const getExamCentersList = require('./modules/get-exam-centers-list.js');
const getStudentsList = require('./modules/get-students-list.js');
const exportToCsv = require('./modules/export-to-csv.js');

// local paths
const dataPath = './data';
const localPaths = {
  metadata: 'metadata',
  tables: 'tables',
  exports: 'exports',
  logs: 'logs',
};

// remote paths @july
const mapPathStartJuly = 'http://static.bacalaureat.edu.ro'; // mapPathStart/year/mapPathEnd
const mapPathEndJuly = 'rapoarte/judete.html';
const hsPathStartJuly = 'http://static.bacalaureat.edu.ro/year/rapoarte'; // hsPathStart/countyCode/hsPathEnd
const hsPathEndJuly = 'lista_unitati';
const ecPathStartJuly = 'http://static.bacalaureat.edu.ro/year/rapoarte'; // ecPathStart/countyCode/ecPathEnd
const ecPathEndJuly = 'unitati_arondate';
const studentsPathJuly = 'http://static.bacalaureat.edu.ro/year/rapoarte/rezultate/alfabetic';

// remote paths @september
const mapPathStartSeptember = 'http://static.bacalaureat.edu.ro'; // mapPathStart/year/mapPathEnd
const mapPathEndSeptember = 'rapoarte_sept/judete.html';
const hsPathStartSeptember = 'http://static.bacalaureat.edu.ro/year/rapoarte_sept'; // hsPathStart/countyCode/hsPathEnd
const hsPathEndSeptember = 'lista_unitati';
const ecPathStartSeptember = 'http://static.bacalaureat.edu.ro/year/rapoarte_sept'; // ecPathStart/countyCode/ecPathEnd
const ecPathEndSeptember = 'unitati_arondate';
const studentsPathSeptember = 'http://static.bacalaureat.edu.ro/year/rapoarte_sept/rezultate/alfabetic';


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
  const logFilePath = `${logsPath}/year.csv`;

  // help text
  const helpText = `\n Available commands:\n\n\
  1. -h : display help text\n\
  2. -d : download metadata for counties and localities\n\
  3. -e [date]: export JSON files found in tables folder to CSV, for the given date [yyyy-mm-dd]\n`;

  // get command line arguments
  const arguments = process.argv;
  console.log('\x1b[34m%s\x1b[0m', '\n@START: CLI arguments >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
  console.table(arguments);
  console.log('\n');

  // get third command line argument
  // if argument is missing, -h is set by default
  const mainArg = process.argv[2] || '-h';
  const secondaryArg = process.argv[3] || '';
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
    console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('STAGE 1: get counties info\n');
    for(let yearIndex = 0; yearIndex < yearList.length; yearIndex += 1) {
      const currentYear = yearList[yearIndex]; // choose year to retrieve data for
      const mapPathJuly = `${mapPathStartJuly}/${currentYear}/${mapPathEndJuly}`;
      const mapPathSeptember = `${mapPathStartSeptember}/${currentYear}/${mapPathEndSeptember}`;
      // console.log(mapPath);
      try {
        const countiesInfoJuly = await getCountiesInfo(mapPathJuly, countiesSavePath.replace('year', `${currentYear}-july`));
        const countiesInfoSeptember = await getCountiesInfo(mapPathSeptember, countiesSavePath.replace('year', `${currentYear}-september`));
        console.log('>>>> await branch >>>>');

        // stage 2: filter counties, only download data for counties in countiesList
        // if countiesList is empty, download all
        // filter july list
        const filteredCountiesJuly = {
          href: countiesInfoJuly.href,
          counties: countiesInfoJuly.counties.filter( item => countiesList.length > 0 ? countiesList.includes(item.name) : true ),
          hsHref: {
            hsPathStart: hsPathStartJuly.replace('year', `${currentYear}`),
            hsPathEnd: hsPathEndJuly,
          },
          ecHref: {
            ecPathStart: ecPathStartJuly.replace('year', `${currentYear}`),
            ecPathEnd: ecPathEndJuly,
          },
          studentsHref: studentsPathJuly,
        }
        // filter september list
        const filteredCountiesSeptember = {
          href: countiesInfoSeptember.href,
          counties: countiesInfoSeptember.counties.filter( item => countiesList.length > 0 ? countiesList.includes(item.name) : true ),
          hsHref: {
            hsPathStart: hsPathStartSeptember.replace('year', `${currentYear}`),
            hsPathEnd: hsPathEndSeptember,
          },
          ecHref: {
            ecPathStart: ecPathStartSeptember.replace('year', `${currentYear}`),
            ecPathEnd: ecPathEndSeptember,
          },
          studentsHref: studentsPathSeptember,
        }

        // stage 3: get exam centers with assigned high schools
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 3: get Exam Centers list\n');
        await getExamCentersList(filteredCountiesJuly, ecSavePath.replace('year', `${currentYear}-july`), logFilePath.replace('year', `${currentYear}-july_ec_log`));
        await getExamCentersList(filteredCountiesSeptember, ecSavePath.replace('year', `${currentYear}-september`), logFilePath.replace('year', `${currentYear}-september_ec_log`));

        // stage 4: get students list
        console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log('STAGE 3: get Students list\n');
        await getStudentsList(currentYear, 'july', studentsPathJuly.replace('year', `${currentYear}`), studentsSavePath.replace('year', `${currentYear}-july`), logFilePath.replace('year', `${currentYear}-july_students_log`));
        await getStudentsList(currentYear, 'september', studentsPathSeptember.replace('year', `${currentYear}`), studentsSavePath.replace('year', `${currentYear}-september`), logFilePath.replace('year', `${currentYear}-september_students_log`));

      } catch (err) {
        console.error(err);
      }

    }

     // 3. else if argument is 'd'
  } else if (mainArg === '-e') {

    // stage 3: get localities DATA
    console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('STAGE 3: export JSON data to CSV\n');

    // check for date argument
    const inMetadataPath = `${dataPath}/${secondaryArg}/${localPaths['metadata']}`;
    const inTablesPath = `${dataPath}/${secondaryArg}/${localPaths['tables']}`;
    // if date argument exists and is valid
    if(secondaryArg != '' && fs.existsSync(inMetadataPath) && fs.existsSync(inTablesPath)) {
      // for each year in year list
      for(let yearIndex = 0; yearIndex < yearList.length; yearIndex += 1) {
        const currentYear = yearList[yearIndex];

        // july
        const ecFilePathJuly = `${inMetadataPath}/${currentYear}-july_exam-centers.json`;
        const stFilePathJuly = `${inTablesPath}/${currentYear}-july_students.json`;
        // check if current year data files exists
        if(fs.existsSync(ecFilePathJuly) && fs.existsSync(stFilePathJuly)) {
          console.log(`${currentYear}-july:: Current year input files found!`);
          // export data to CSV
          const csvFilePathJuly = `${dataPath}/${secondaryArg}/${localPaths['exports']}/${currentYear}-iulie_lista-elevi.csv`;
          exportToCsv(currentYear, 'july', ecFilePathJuly,stFilePathJuly, csvFilePathJuly);

        } else {
          console.log(`${currentYear}-july:: Current year input files NOT found!`);
        }

        // september
        const ecFilePathSeptember = `${inMetadataPath}/${currentYear}-september_exam-centers.json`;
        const stFilePathSeptember = `${inTablesPath}/${currentYear}-september_students.json`;
        // check if current year data files exists
        if(fs.existsSync(ecFilePathSeptember) && fs.existsSync(stFilePathSeptember)) {
          console.log(`${currentYear}-september:: Current year input files found!`);
          // export data to CSV
          const csvFilePathSeptember = `${dataPath}/${secondaryArg}/${localPaths['exports']}/${currentYear}-septembrie_lista-elevi.csv`;
          exportToCsv(currentYear, 'september', ecFilePathSeptember, stFilePathSeptember, csvFilePathSeptember);

        } else {
          console.log(`${currentYear}-september:: Current year input files NOT found!`);
        }
      }
    } else {
      console.log('Date missing from argument list. Check help.');
    }


    // else print help
  } else {
    console.log(helpText);
  }

}


// ////////////////////////////////////////////////////////////////////////////
// // MAIN
main();
