// Function to calculate Greatest Common Divisor (Euclid's Algorithm)
function gcd(a, b) {
    return b === 0n ? a : gcd(b, a % b);
}

// Extended Euclidean Algorithm to find modular inverse
// Finds d such that (d * e) % phi === 1
function modInverse(e, phi) {
    let m0 = phi, t, q;
    let x0 = 0n, x1 = 1n;
    if (phi === 1n) return 0n;
    while (e > 1n) {
        q = e / phi;
        t = phi;
        phi = e % phi;
        e = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
    }
    if (x1 < 0n) x1 += m0;
    return x1;
}

// Power function for modular exponentiation (a^b % n)
function power(base, exp, mod) {
    let res = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % mod;
        base = (base * base) % mod;
        exp = exp / 2n;
    }
    return res;
}

// 1. Large Prime Numbers (p and q)
// Normally these are generated randomly, but here we define them explicitly for the demo
const p = BigInt("12345678901234567890123456789012345678901234567891"); 
const q = BigInt("98765432109876543210987654321098765432109876543211");

// 2. Calculate n = p * q
const n = p * q;

// 3. Calculate Totient Phi = (p-1) * (q-1)
const phi = (p - 1n) * (q - 1n);

// 4. Public Exponent (Standard value 65537)
const e = 65537n;

// 5. Calculate Private Exponent (d)
const d = modInverse(e, phi);

// Encryption function: C = M^e mod n
function encryptData(text) {
    const msg = BigInt(Buffer.from(text).toString("hex"), 16);
    return power(msg, e, n).toString(); // Return as string
}

// Decryption function: M = C^d mod n
function decryptData(cipher) {
    const msg = power(BigInt(cipher), d, n);
    return Buffer.from(msg.toString(16), "hex").toString();
}

module.exports = { encryptData, decryptData, n, e, d };




// RSA using Node crypto (Number Theory concept)
// const crypto = require("crypto");


// const privateKey = process.env.RSA_PRIVATE_KEY.replace(/\\n/g, '\n');
// const publicKey = process.env.RSA_PUBLIC_KEY.replace(/\\n/g, '\n');

// Generate keys once (server start)
// const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
//     modulusLength: 2048,
// });

// Encrypt
// function encryptData(data) {
//     return crypto.publicEncrypt(publicKey, Buffer.from(data)).toString("base64");
// }

// Decrypt (for demo/logging)
// function decryptData(data) {
//     return crypto.privateDecrypt(privateKey, Buffer.from(data, "base64")).toString();
// }

// module.exports = { encryptData, decryptData };