const crypto = require('crypto');
const logger = require('../utils/logger');

const mockTxHash = () =>
  '0x' + crypto.randomBytes(32).toString('hex');

const mockBlockNumber = () =>
  Math.floor(60000000 + Math.random() * 1000000);

const mockGasUsed = () =>
  (50000 + Math.floor(Math.random() * 50000)).toString();

const generateHash = (data) => {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
};

const registerOnBlockchain = async (hash, recipientAddress) => {
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

  const txHash = mockTxHash();
  const blockNumber = mockBlockNumber();

  logger.info(`[MOCK] Blockchain register: hash=${hash.slice(0, 16)}... tx=${txHash.slice(0, 12)}...`);

  return {
    txHash,
    blockNumber,
    gasUsed: mockGasUsed(),
  };
};

const verifyOnBlockchain = async (hash) => {
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));

  logger.info(`[MOCK] Blockchain verify: hash=${hash.slice(0, 16)}...`);

  return {
    isValid: true,
    recipient: '0x0000000000000000000000000000000000000000',
    issuedAt: new Date().toISOString(),
  };
};

const uploadToIPFS = async (pdfBuffer, fileName) => {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

  const cid = 'Qm' + crypto.randomBytes(22).toString('hex').slice(0, 44);

  logger.info(`[MOCK] IPFS upload: file=${fileName} cid=${cid.slice(0, 16)}...`);

  return {
    cid,
    url: `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
};

const getNetworkInfo = async () => {
  await new Promise((r) => setTimeout(r, 100));

  return {
    chainId: '80002',
    name: 'polygon-amoy',
    blockNumber: mockBlockNumber(),
    isMock: true,
  };
};

module.exports = {
  generateHash,
  registerOnBlockchain,
  verifyOnBlockchain,
  uploadToIPFS,
  getNetworkInfo,
};