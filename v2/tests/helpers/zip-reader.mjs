import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const endOfCentralDirectorySignature = 0x06054b50;
const centralDirectorySignature = 0x02014b50;
const localFileSignature = 0x04034b50;
const maxArchiveBytes = 64 * 1024 * 1024;
const maxEntryCount = 4096;

function fail(message) {
  throw new Error(message);
}

/**
 * 读取测试产物的中央目录和文件字节，避免测试依赖平台自带 unzip 命令。
 */
export function readZipEntries(path) {
  const archive = readFileSync(path);
  if (archive.byteLength > maxArchiveBytes) fail("Test ZIP exceeds the 64 MiB inspection limit.");

  // 从 ZIP 尾部的最大注释窗口内定位 EOCD。
  const searchStart = Math.max(0, archive.byteLength - 65_557);
  let eocdOffset = -1;
  for (let offset = archive.byteLength - 22; offset >= searchStart; offset -= 1) {
    if (archive.readUInt32LE(offset) === endOfCentralDirectorySignature) {
      eocdOffset = offset;
      break;
    }
  }
  if (eocdOffset < 0) fail("ZIP end-of-central-directory record is missing.");

  const entryCount = archive.readUInt16LE(eocdOffset + 10);
  const centralOffset = archive.readUInt32LE(eocdOffset + 16);
  if (entryCount > maxEntryCount) fail("ZIP entry count exceeds the test inspection limit.");

  // 以中央目录给出的压缩大小读取本地记录，兼容 data descriptor 写法。
  const entries = new Map();
  let cursor = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (archive.readUInt32LE(cursor) !== centralDirectorySignature) {
      fail("ZIP central-directory entry is invalid.");
    }
    const compressionMethod = archive.readUInt16LE(cursor + 10);
    const compressedSize = archive.readUInt32LE(cursor + 20);
    const uncompressedSize = archive.readUInt32LE(cursor + 24);
    const nameLength = archive.readUInt16LE(cursor + 28);
    const extraLength = archive.readUInt16LE(cursor + 30);
    const commentLength = archive.readUInt16LE(cursor + 32);
    const localOffset = archive.readUInt32LE(cursor + 42);
    const name = archive.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    if (!name || entries.has(name)) fail(`ZIP contains an empty or duplicate entry: ${name}.`);
    if (archive.readUInt32LE(localOffset) !== localFileSignature) {
      fail(`ZIP local entry is invalid: ${name}.`);
    }
    const localNameLength = archive.readUInt16LE(localOffset + 26);
    const localExtraLength = archive.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = archive.subarray(dataOffset, dataOffset + compressedSize);
    const contents = compressionMethod === 0
      ? Buffer.from(compressed)
      : compressionMethod === 8
        ? inflateRawSync(compressed)
        : fail(`Unsupported ZIP compression method ${compressionMethod}.`);
    if (contents.byteLength !== uncompressedSize) {
      fail(`ZIP entry size mismatch: ${name}.`);
    }
    entries.set(name, contents);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
