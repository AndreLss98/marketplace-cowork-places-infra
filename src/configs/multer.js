const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const storageType = {
    local: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', 'tmp', 'uploads'))
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

module.exports = {
    dest: path.resolve(__dirname, '..', 'tmp', 'uploads'),
    storage: storageType[process.env.STORAGE_TYPE],
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/jpg', 'image/png'];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
};