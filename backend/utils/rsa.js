// RSA using Node crypto (Number Theory concept)
const crypto = require("crypto");


// const privateKey = process.env.RSA_PRIVATE_KEY.replace(/\\n/g, '\n');
// const publicKey = process.env.RSA_PUBLIC_KEY.replace(/\\n/g, '\n');

// Generate keys once (server start)
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
});

// Encrypt
function encryptData(data) {
    return crypto.publicEncrypt(publicKey, Buffer.from(data)).toString("base64");
}

// Decrypt (for demo/logging)
function decryptData(data) {
    return crypto.privateDecrypt(privateKey, Buffer.from(data, "base64")).toString();
}

module.exports = { encryptData, decryptData };