const { ethers } = require('ethers');
const crypto = require('crypto');
const logger = require('../utils/logger');

const CONTRACT_ABI = [
  "function issueCertificate(bytes32 hash, address recipient) external",
  "function verifyCertificate(bytes32 hash) external view returns (bool isValid, address recipient, uint256 issuedAt)",
];

const getContract = () => {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
};

const generateHash = (data) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
};

const registerOnBlockchain = async (hash, recipientAddress) => {
  try {
    const contract = getContract();
    const bytes32Hash = '0x' + hash;
    const recipient = recipientAddress || ethers.ZeroAddress;

    const tx = await contract.issueCertificate(bytes32Hash, recipient);
    logger.info(`TX илгээгдлээ: ${tx.hash}`);

    const receipt = await tx.wait();
    logger.info(`Блокчейнд бүртгэгдлээ: block=${receipt.blockNumber}`);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (err) {
    logger.error(`Блокчейн алдаа: ${err.message}`);
    throw err;
  }
};

const verifyOnBlockchain = async (hash) => {
  try {
    const contract = getContract();
    const bytes32Hash = '0x' + hash;
    const [isValid, recipient, issuedAt] = await contract.verifyCertificate(bytes32Hash);

    return {
      isValid,
      recipient,
      issuedAt: new Date(Number(issuedAt) * 1000).toISOString(),
    };
  } catch (err) {
    logger.error(`Verify алдаа: ${err.message}`);
    return { isValid: false };
  }
};

const getNetworkInfo = async () => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    return {
      chainId: network.chainId.toString(),
      name: network.name,
      blockNumber,
      isMock: false,
    };
  } catch (err) {
    return { isMock: true };
  }
};

module.exports = {
  generateHash,
  registerOnBlockchain,
  verifyOnBlockchain,
  getNetworkInfo,
};