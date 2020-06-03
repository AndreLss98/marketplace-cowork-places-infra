const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const storageType = {
    local: (folder) => multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', 'public', 'tmp', 'uploads', folder))
        },
        filename: (req, file, cb) =>{
            crypto.randomBytes(16, (error, hash) => {
                if (error) cb (error);
                file.key = `${hash.toString('hex')}-${file.originalname}`;

                cb(null, file.key);
            })
        }
    })
}

module.exports = (folder) => {
    return {
        dest: path.resolve(__dirname, '..', '..', 'public', 'tmp', 'uploads', folder),
        storage: storageType[process.env.STORAGE_TYPE](folder),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/jpg', 'image/png', 'text/markdown'];
    
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type'));
            }
        }
    };
}