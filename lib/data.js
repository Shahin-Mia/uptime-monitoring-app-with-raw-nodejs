// dependencies
const fs = require('fs');
const path = require('path');

// module scaffolding
const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to File
lib.create = (dir, file, data, callback) => {
    // Make the dir manually in the baseDir
    // open file for write
    fs.open(`${lib.baseDir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (err2) {
                    callback('Error writing to new file!');
                } else {
                    fs.close(fileDescriptor, (err3) => {
                        if (err3) {
                            callback('Error closing the new file!');
                        } else {
                            callback(false);
                        }
                    });
                }
            });
        } else {
            callback('There was an error, file may already exists!');
        }
    });
};

lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (err) {
            callback(err);
        } else {
            fs.ftruncate(fileDescriptor, (err2) => {
                if (err2) {
                    callback(err2);
                } else {
                    const stringData = JSON.stringify(data);

                    fs.writeFile(fileDescriptor, stringData, (err3) => {
                        if (err3) {
                            callback(err3);
                        } else {
                            fs.close(fileDescriptor, (err4) => {
                                if (err4) {
                                    callback(err4);
                                } else {
                                    callback(false);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err) => {
        if (err) {
            callback(err);
        } else {
            callback(false);
        }
    });
};

lib.getDataList = (dir, callback) => {
    fs.readdir(`${lib.baseDir + dir}/`, (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            const trimmedFileName = [];
            fileNames.forEach((fileName) => {
                trimmedFileName.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileName);
        } else {
            callback('Data not found!');
        }
    });
};

module.exports = lib;
