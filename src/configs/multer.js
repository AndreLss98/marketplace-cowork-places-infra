const {
    STORAGE_TYPE,
    AWS_ACCESS_KEY,
    AWS_BUCKET_NAME,
    AWS_SECRET_ACCESS_KEY
} = process.env;

const path = require('path');
const aws = require('aws-sdk');
const crypto = require('crypto');
const multer = require('multer');
const multerS3 = require('multer-s3');

function processFileName(file, randomName) {
    file.originalname = file.originalname.replace(/\s/g, '');
    try {
        if (randomName) {
            const hash = crypto.randomBytes(16);
            file.key = `${hash.toString('hex')}-${file.originalname}`;
            return file.key;
        } else {
            return file.originalname;
        }
    } catch (error) {
        throw error;
    }
}

const storageType = {
    local: (folder, randomName) => multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', 'public', 'tmp', 'uploads', folder))
        },
        filename: (req, file, cb) => {
            try {
                const fileUrl = processFileName(file, randomName);
                cb (null, fileUrl);
            } catch (error) {
                cb(error);
            }
        }
    }),
    s3: (folder, randomName) => {
        try {
            return multerS3({
                s3: new aws.S3({
                    accessKeyId: AWS_ACCESS_KEY,
                    secretAccessKey: AWS_SECRET_ACCESS_KEY
                }),
                bucket: AWS_BUCKET_NAME,
                contentType: multerS3.AUTO_CONTENT_TYPE,
                acl: 'public-read',
                key: (req, file, cb) => {
                    try {
                        const fileUrl = processFileName(file, randomName);
                        cb(null, `${folder}/${fileUrl}`);
                    } catch (error) {
                        console.log('Errro na aws: ', error);
                        cb(error);
                    }
                }
            });
        } catch(error) {
            throw error;
        }
    }
}

module.exports = (folder, randomName = true) => {
    return {
        dest: path.resolve(__dirname, '..', '..', 'public', 'tmp', 'uploads', folder),
        storage: storageType[STORAGE_TYPE](folder, randomName),
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