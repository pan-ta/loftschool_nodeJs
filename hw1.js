const path = require('path');
const fs = require('fs');

console.log('Данный скрипт работает с директорией, в которой запущен.\nФайлы, включая вложенные, будут разложены по папкам в соттветствии с названием.\nИмя итоговой папки можно задать переметром.');
const initDir = process.cwd();
// create new parent dir
const newParentDirName = process.argv[2] ? process.argv.slice(2).join(' ') : "Моя коллекция";
const newParentDirPath = path.join(initDir, newParentDirName);
if (!fs.existsSync(newParentDirPath)) {
    fs.mkdirSync(newParentDirPath);
}

const processFilesRecurs = (base, level) => {
    const fileNames = fs.readdirSync(base);
    // exclude script file
    const scriptFileName = path.parse(process.argv[1]).base;

    fileNames.forEach(fileName => {
        if (fileName !== scriptFileName && fileName !== newParentDirName) {
            let currFilePath = path.join(base, fileName);
            let fileInfo = fs.statSync(currFilePath);
            if (fileInfo.isDirectory()) {
                // process folder
                processFilesRecurs(currFilePath, level + 1);
                // delete folder
                fs.rmdirSync(currFilePath);
                console.error(`Папка ${fileName} удалена.`);
            } else {
                // create new folder in init dir
                const newDirName = getNewFolderNameByFileName(fileName);
                const newDirPath = path.join(newParentDirPath, newDirName);
                if (!fs.existsSync(newDirPath)) {
                    fs.mkdirSync(newDirPath);
                }
                // copy file to new dir
                const newFilePath = path.join(newDirPath, fileName);
                if (!fs.existsSync(newFilePath)) {
                    fs.linkSync(currFilePath, newFilePath);
                    console.error(`Файл с именем ${fileName} успешно скопирован.`);
                } else {
                    console.error(`Файл с именем ${fileName} обнаружен в разных директориях. Был скопирован первый найденный вариант.`);
                }
                // delete init file
                fs.unlinkSync(currFilePath);
            }
        }
    })
}

const getNewFolderNameByFileName = (fileName) => {
    return fileName.toUpperCase().substring(0, 1)
}

processFilesRecurs(initDir, 0);