const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const storageType = {
    local: (folder, randomName) => multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', 'public', 'tmp', 'uploads', folder))
        },
        filename: (req, file, cb) => {
            if (randomName) {
                crypto.randomBytes(16, (error, hash) => {
                    if (error) cb (error);
                    file.key = `${hash.toString('hex')}-${file.originalname}`;
    
                    cb(null, file.key);
                })
            } else {
                cb(null, file.originalname);
            }
        }
    })
}

module.exports = (folder, randomName = true) => {
    return {
        dest: path.resolve(__dirname, '..', '..', 'public', 'tmp', 'uploads', folder),
        storage: storageType[process.env.STORAGE_TYPE](folder, randomName),
        limits: { fileSize: 100 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/jpg', 'image/png', 'text/markdown', 'application/pdf'];
    
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type'));
            }
        }
    };
}