const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const AWS = require("aws-sdk");

// If you want to use an unic ID on the name of your files
// const { v4: uuid } = require("uuid");

const mime = require("mime-types");

// console.log(dotenv.config());
const { parsed } = dotenv.config();
if (!parsed.DO_SPACES_ENDPOINT || !parsed.DO_SPACES_KEY || !parsed.DO_SPACES_SECRET || !parsed.DO_SPACES_NAME) {
    console.log("Error parsing the env variables! Make sure you provided the correct .env file!");
    process.exit(0);
}

const spacesEndpoint = new AWS.Endpoint(`${process.env.DO_SPACES_ENDPOINT}/raffles/images`);

const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
});


/**
 * Function to list files of a space
 */

// const params = {
//   Bucket: 'cdn-buscarrural',
// }

// s3.listObjects(params, function(err, data) {
//   if (err) console.log(err, err.stack);
//       else {
//           data['Contents'].forEach(function(obj) {
//           console.log(obj['Key']);
//       })};
//   });


/**
 * Function to upload file
 */

const uploadFileToDO = ({ filePath, ACL = "public-read" }) => {
  const name = filePath.split("\\", 6);    
  const teste1 = name[5].split(".");
  
  const contentType = mime.contentType(filePath);
  const ext = mime.extensions[contentType][0];    
  const fileName = teste1[0] + "." + ext;
    
    return new Promise((resolve, reject) => {
        const buffer = fs.readFileSync(filePath);
        s3.putObject({ 
          Bucket: process.env.DO_SPACES_NAME, 
          Key: fileName, 
          ACL: ACL, 
          Body: buffer, 
          ContentType: contentType
        },
          (err, data) => {
            if (err) {
                reject(err);
            } else {
                data.Url = `https://${process.env.DO_URL_SPACES_NAME}/raffles/images/${fileName}`;
                resolve(data);

                // Uncommend this incase you want to get files with ACL = private
                // s3.getSignedUrl("getObject", { Bucket: process.env.DO_SPACES_NAME, Key: fileName }, (err, url) => {
                //     if (err) {
                //         reject(err);
                //     } else {
                //         resolve({ Url: url, Etag: data.ETag });
                //     }
                // })
            }
        })
    })
}

const fileName = "exemplo.png";
const filePath = path.resolve(__dirname, "..", "files", fileName);

uploadFileToDO({ filePath: filePath })
    .then(data => {
        console.log(data);
        // do whatever you want with it (save in database etc.)
    })
    .catch(err => {
        console.log(err);
    })