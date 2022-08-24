const fs = require('fs');
const path = require('path');
const pinataSDK = require('@pinata/sdk');

// load the api keys and initialize the pinata connection
const keys = require("./pinata_keys")
const pinata = pinataSDK(keys.API_KEYS.key, keys.API_KEYS.secret)

console.log(keys.API_KEYS.key);
console.log(keys.API_KEYS.secret);

pinata.testAuthentication().then((result) => {
    //successful authentication here
    console.log(result);

    // call main
    main();


}).catch((err) => {
    //handle error here
    console.log(err);
});

function cleanAttributes(attributes) {
    const cleanAttributes = {}
    for(var item in attributes) {

        // remove the .001 in the attributes
        let value = attributes[item].value;
        if(value.includes(".")) {
            attributes[item].value = value.substring(0,value.indexOf("."));
        }

        // reformat the attributes for cnft
        cleanAttributes[attributes[item].trait_type] = attributes[item].value;

    }

    return cleanAttributes;
}

async function main() {

    // build the default path to this directory
    const basePath = path.join(__dirname, '..', 'ipfsUploader')

    // read the whole directory
    const files = fs.readdirSync(basePath+`\\png`)

    // for each nft in the collection
    for ( var index = 0; index < 1 /*files.length*/; index++ ) {

        // build path to the information
        const imagePath = basePath+`\\png\\${files[index + 1]}`;
        const metadataPath = basePath+`\\metadata\\${index + 1}.json`;
        const resultPath = basePath+`\\result\\${index + 1}.json`;

        // build default values in metadata
        const metadata = {
            id: index + 1,
            name: `SPACE DOODS ${index + 1}`,
            mediaType: "image/png",
            website: "https://www.spacetimemeta.io/"
        }

        // upload the image to IPFS
        const readableStreamForFile = fs.createReadStream(imagePath);
        let result = {IpfsHash: "1234"}//await pinata.pinFileToIPFS(readableStreamForFile);

        // add the hash in the metadata
        metadata.image = result.IpfsHash;
        
        // extract the attributes
        var attributes = fs.readFileSync(metadataPath);
        attributes = JSON.parse(attributes);
        metadata.attributes = cleanAttributes(attributes.attributes);

        // save the new metadata
        fs.writeFileSync(resultPath, JSON.stringify(metadata));
        console.log(`JSON data is saved for Doods: ${metadata.id}\t\t\tWith IPFS hash: ${metadata.image}`);
    }
}