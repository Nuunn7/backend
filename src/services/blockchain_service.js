// const { ethers } = require('ethers');
// const crypto = require('crypto');
// const axios = require('axios');
// const FormData = require('form-data');
// const logger = require('../utils/logger');

// const CONTRACT_ABI = [
//   'function issueCertificate(bytes32 hash, address recipient) external',
//   'function verifyCertificate(bytes32 hash) external view returns (bool, address, uint256)',
//   'event CertificateIssued(bytes32 indexed hash, address indexed recipient, uint256 timestamp)',
// ];

// const getProvider = () => {
//   const rpcUrl = process.env.POLYGON_RPC_URL;
//   if (!rpcUrl) throw new Error('POLYGON_RPC_URL тохируулагдаагүй байна');
//   return new ethers.JsonRpcProvider(rpcUrl);
// };

// const getSigner = () => {
//   const privateKey = process.env.PRIVATE_KEY;
//   if (!privateKey) throw new Error('PRIVATE_KEY тохируулагдаагүй байна');
//   const provider = getProvider();
//   return new ethers.Wallet(privateKey, provider);
// };

// const getContract = () => {
//   const contractAddress = process.env.CONTRACT_ADDRESS;
//   if (!contractAddress) throw new Error('CONTRACT_ADDRESS тохируулагдаагүй байна');
//   const signer = getSigner();
//   return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
// };

// // 1. SHA-256 хэш үүсгэх 
// const generateHash = (data) => {
//   const str = JSON.stringify(data);
//   return crypto.createHash('sha256').update(str).digest('hex');
// };

// // 2. Блокчейнд бүртгэх
// const registerOnBlockchain = async (hash, recipientAddress) => {
//   try {
//     const contract = getContract();

//     // hex хэшийг bytes32 болгох
//     const bytes32Hash = '0x' + hash;

//     // recipient хаяг байхгүй бол zero address ашиглана
//     const recipient = recipientAddress || ethers.ZeroAddress;

//     logger.info(`Блокчейнд бүртгэж байна: hash=${hash.slice(0, 16)}...`);

//     const tx = await contract.issueCertificate(bytes32Hash, recipient);
//     logger.info(`Гүйлгээ илгээгдлээ: txHash=${tx.hash}`);

//     const receipt = await tx.wait();
//     logger.info(`Гүйлгээ баталгаажлаа: block=${receipt.blockNumber}`);

//     return {
//       txHash: tx.hash,
//       blockNumber: receipt.blockNumber,
//       gasUsed: receipt.gasUsed.toString(),
//     };
//   } catch (err) {
//     logger.error(`Блокчейн бүртгэлт амжилтгүй: ${err.message}`);
//     throw new Error(`Блокчейн бүртгэлт амжилтгүй: ${err.message}`);
//   }
// };

// // 3. Блокчейнээс баталгаажуулах
// const verifyOnBlockchain = async (hash) => {
//   try {
//     const contract = getContract();
//     const bytes32Hash = '0x' + hash;

//     const [isValid, recipient, timestamp] = await contract.verifyCertificate(bytes32Hash);

//     return {
//       isValid,
//       recipient,
//       issuedAt: isValid ? new Date(Number(timestamp) * 1000).toISOString() : null,
//     };
//   } catch (err) {
//     logger.error(`Блокчейн баталгаажуулалт амжилтгүй: ${err.message}`);
//     throw new Error(`Блокчейн баталгаажуулалт амжилтгүй: ${err.message}`);
//   }
// };

// // 4. IPFS-д PDF хуулах (Pinata)
// const uploadToIPFS = async (pdfBuffer, fileName) => {
//   try {
//     const apiKey = process.env.PINATA_API_KEY;
//     const secretKey = process.env.PINATA_SECRET_KEY;

//     if (!apiKey || !secretKey) {
//       throw new Error('PINATA_API_KEY эсвэл PINATA_SECRET_KEY тохируулагдаагүй байна');
//     }

//     const formData = new FormData();
//     formData.append('file', pdfBuffer, {
//       filename: fileName || 'certificate.pdf',
//       contentType: 'application/pdf',
//     });

//     formData.append(
//       'pinataMetadata',
//       JSON.stringify({ name: fileName || 'certificate.pdf' })
//     );

//     const response = await axios.post(
//       'https://api.pinata.cloud/pinning/pinFileToIPFS',
//       formData,
//       {
//         maxBodyLength: Infinity,
//         headers: {
//           ...formData.getHeaders(),
//           pinata_api_key: apiKey,
//           pinata_secret_api_key: secretKey,
//         },
//       }
//     );

//     const cid = response.data.IpfsHash;
//     logger.info(`IPFS-д хуулагдлаа: CID=${cid}`);

//     return {
//       cid,
//       url: `https://gateway.pinata.cloud/ipfs/${cid}`,
//     };
//   } catch (err) {
//     logger.error(`IPFS хуулалт амжилтгүй: ${err.message}`);
//     throw new Error(`IPFS хуулалт амжилтгүй: ${err.message}`);
//   }
// };

// // ── 5. Polygon сүлжээний мэдээлэл авах ──────────────────────────────────────
// const getNetworkInfo = async () => {
//   try {
//     const provider = getProvider();
//     const network = await provider.getNetwork();
//     const blockNumber = await provider.getBlockNumber();

//     return {
//       chainId: network.chainId.toString(),
//       name: network.name,
//       blockNumber,
//     };
//   } catch (err) {
//     logger.error(`Сүлжээний мэдээлэл авахад алдаа: ${err.message}`);
//     throw new Error(`Сүлжээний мэдээлэл авахад алдаа: ${err.message}`);
//   }
// };

// module.exports = {
//   generateHash,
//   registerOnBlockchain,
//   verifyOnBlockchain,
//   uploadToIPFS,
//   getNetworkInfo,
// };