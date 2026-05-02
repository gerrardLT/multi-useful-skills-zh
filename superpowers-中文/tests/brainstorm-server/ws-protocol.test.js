/**
 * 零依赖 WebSocket 协议实现的单元测试。
 *
 * 这里测试的是与 HTTP 服务解耦的协议层能力：
 * - WebSocket 握手计算
 * - 帧编码与解码
 * - 协议边界与异常行为
 *
 * 被测模块需要导出：
 *   - computeAcceptKey(clientKey) -> string
 *   - encodeFrame(opcode, payload) -> Buffer
 *   - decodeFrame(buffer) -> { opcode, payload, bytesConsumed } | null
 *   - OPCODES: { TEXT, CLOSE, PING, PONG }
 */

const assert = require('assert');
const crypto = require('crypto');
const path = require('path');

// 被测模块：零依赖 server 文件
const SERVER_PATH = path.join(__dirname, '../../skills/brainstorming/scripts/server.cjs');
let ws;

try {
  ws = require(SERVER_PATH);
} catch (e) {
  // 模块可能还不存在；这是 TDD 阶段可以接受的失败
  console.error(`无法加载 ${SERVER_PATH}: ${e.message}`);
  console.error('如果你是在实现前先跑测试，这种失败是预期内的。');
  process.exit(1);
}

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (e) {
      console.log(`  FAIL: ${name}`);
      console.log(`    ${e.message}`);
      failed++;
    }
  }

  // ========== 握手 ==========
  console.log('\n--- WebSocket 握手 ---');

  test('computeAcceptKey 能生成正确的 RFC 6455 accept 值', () => {
    // RFC 6455 第 4.2.2 节示例
    // 魔术 GUID 为 "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    const clientKey = 'dGhlIHNhbXBsZSBub25jZQ==';
    const expected = 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=';
    assert.strictEqual(ws.computeAcceptKey(clientKey), expected);
  });

  test('computeAcceptKey 对随机 key 也会生成合法 base64', () => {
    for (let i = 0; i < 10; i++) {
      const randomKey = crypto.randomBytes(16).toString('base64');
      const result = ws.computeAcceptKey(randomKey);
      assert.strictEqual(Buffer.from(result, 'base64').toString('base64'), result);
      assert.strictEqual(result.length, 28);
    }
  });

  // ========== 编码 ==========
  console.log('\n--- 帧编码（server -> client）---');

  test('编码小文本帧（< 126 字节）', () => {
    const payload = 'Hello';
    const frame = ws.encodeFrame(ws.OPCODES.TEXT, Buffer.from(payload));
    assert.strictEqual(frame[0], 0x81);
    assert.strictEqual(frame[1], 5);
    assert.strictEqual(frame.slice(2).toString(), 'Hello');
    assert.strictEqual(frame.length, 7);
  });

  test('编码空文本帧', () => {
    const frame = ws.encodeFrame(ws.OPCODES.TEXT, Buffer.alloc(0));
    assert.strictEqual(frame[0], 0x81);
    assert.strictEqual(frame[1], 0);
    assert.strictEqual(frame.length, 2);
  });

  test('编码中型文本帧（126-65535 字节）', () => {
    const payload = Buffer.alloc(200, 0x41);
    const frame = ws.encodeFrame(ws.OPCODES.TEXT, payload);
    assert.strictEqual(frame[0], 0x81);
    assert.strictEqual(frame[1], 126);
    assert.strictEqual(frame.readUInt16BE(2), 200);
    assert.strictEqual(frame.slice(4).toString(), payload.toString());
    assert.strictEqual(frame.length, 204);
  });

  test('编码恰好 126 字节的边界帧', () => {
    const payload = Buffer.alloc(126, 0x42);
    const frame = ws.encodeFrame(ws.OPCODES.TEXT, payload);
    assert.strictEqual(frame[1], 126);
    assert.strictEqual(frame.readUInt16BE(2), 126);
    assert.strictEqual(frame.length, 130);
  });

  test('编码恰好 125 字节的短帧边界', () => {
    const payload = Buffer.alloc(125, 0x43);
    const frame = ws.encodeFrame(ws.OPCODES.TEXT, payload);
    assert.strictEqual(frame[1], 125);
    assert.strictEqual(frame.length, 127);
  });

  test('编码大型帧（> 65535 字节）', () => {
    const payload = Buffer.alloc(70000, 0x44);
    const frame = ws.encodeFrame(ws.OPCODES.TEXT, payload);
    assert.strictEqual(frame[0], 0x81);
    assert.strictEqual(frame[1], 127);
    const len = Number(frame.readBigUInt64BE(2));
    assert.strictEqual(len, 70000);
    assert.strictEqual(frame.length, 10 + 70000);
  });

  test('编码 close 帧', () => {
    const frame = ws.encodeFrame(ws.OPCODES.CLOSE, Buffer.alloc(0));
    assert.strictEqual(frame[0], 0x88);
    assert.strictEqual(frame[1], 0);
  });

  test('编码带载荷的 pong 帧', () => {
    const payload = Buffer.from('ping-data');
    const frame = ws.encodeFrame(ws.OPCODES.PONG, payload);
    assert.strictEqual(frame[0], 0x8A);
    assert.strictEqual(frame[1], payload.length);
    assert.strictEqual(frame.slice(2).toString(), 'ping-data');
  });

  test('服务端发出的帧永远不带 mask', () => {
    const frame = ws.encodeFrame(ws.OPCODES.TEXT, Buffer.from('test'));
    assert.strictEqual(frame[1] & 0x80, 0);
  });

  // ========== 解码 ==========
  console.log('\n--- 帧解码（client -> server）---');

  // 构造一个带 mask 的客户端帧
  function makeClientFrame(opcode, payload, fin = true) {
    const buf = Buffer.from(payload);
    const mask = crypto.randomBytes(4);
    const masked = Buffer.alloc(buf.length);
    for (let i = 0; i < buf.length; i++) {
      masked[i] = buf[i] ^ mask[i % 4];
    }

    let header;
    const finBit = fin ? 0x80 : 0x00;
    if (buf.length < 126) {
      header = Buffer.alloc(6);
      header[0] = finBit | opcode;
      header[1] = 0x80 | buf.length;
      mask.copy(header, 2);
    } else if (buf.length < 65536) {
      header = Buffer.alloc(8);
      header[0] = finBit | opcode;
      header[1] = 0x80 | 126;
      header.writeUInt16BE(buf.length, 2);
      mask.copy(header, 4);
    } else {
      header = Buffer.alloc(14);
      header[0] = finBit | opcode;
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(buf.length), 2);
      mask.copy(header, 10);
    }

    return Buffer.concat([header, masked]);
  }

  test('解码小型带 mask 文本帧', () => {
    const frame = makeClientFrame(0x01, 'Hello');
    const result = ws.decodeFrame(frame);
    assert(result, '应该返回结果');
    assert.strictEqual(result.opcode, ws.OPCODES.TEXT);
    assert.strictEqual(result.payload.toString(), 'Hello');
    assert.strictEqual(result.bytesConsumed, frame.length);
  });

  test('解码空文本帧', () => {
    const frame = makeClientFrame(0x01, '');
    const result = ws.decodeFrame(frame);
    assert(result, '应该返回结果');
    assert.strictEqual(result.opcode, ws.OPCODES.TEXT);
    assert.strictEqual(result.payload.length, 0);
  });

  test('解码中型带 mask 文本帧（126-65535 字节）', () => {
    const payload = 'A'.repeat(200);
    const frame = makeClientFrame(0x01, payload);
    const result = ws.decodeFrame(frame);
    assert(result, '应该返回结果');
    assert.strictEqual(result.payload.toString(), payload);
  });

  test('解码大型带 mask 文本帧（> 65535 字节）', () => {
    const payload = 'B'.repeat(70000);
    const frame = makeClientFrame(0x01, payload);
    const result = ws.decodeFrame(frame);
    assert(result, '应该返回结果');
    assert.strictEqual(result.payload.length, 70000);
    assert.strictEqual(result.payload.toString(), payload);
  });

  test('解码带 mask 的 close 帧', () => {
    const frame = makeClientFrame(0x08, '');
    const result = ws.decodeFrame(frame);
    assert(result, '应该返回结果');
    assert.strictEqual(result.opcode, ws.OPCODES.CLOSE);
  });

  test('解码带 mask 的 ping 帧', () => {
    const frame = makeClientFrame(0x09, 'ping!');
    const result = ws.decodeFrame(frame);
    assert(result, '应该返回结果');
    assert.strictEqual(result.opcode, ws.OPCODES.PING);
    assert.strictEqual(result.payload.toString(), 'ping!');
  });

  test('头部字节不足时返回 null', () => {
    const result = ws.decodeFrame(Buffer.from([0x81]));
    assert.strictEqual(result, null, '1 字节缓冲区应返回 null');
  });

  test('头部完整但载荷被截断时返回 null', () => {
    const frame = makeClientFrame(0x01, 'Hello World');
    const truncated = frame.slice(0, frame.length - 3);
    const result = ws.decodeFrame(truncated);
    assert.strictEqual(result, null, '截断帧应返回 null');
  });

  test('扩展长度头不完整时返回 null', () => {
    const buf = Buffer.alloc(3);
    buf[0] = 0x81;
    buf[1] = 0x80 | 126;
    const result = ws.decodeFrame(buf);
    assert.strictEqual(result, null);
  });

  test('拒绝未加 mask 的客户端帧', () => {
    const buf = Buffer.alloc(7);
    buf[0] = 0x81;
    buf[1] = 5;
    Buffer.from('Hello').copy(buf, 2);
    assert.throws(() => ws.decodeFrame(buf), /mask/i, '必须拒绝未加 mask 的客户端帧');
  });

  test('能处理同一缓冲区中的多个帧', () => {
    const frame1 = makeClientFrame(0x01, 'first');
    const frame2 = makeClientFrame(0x01, 'second');
    const combined = Buffer.concat([frame1, frame2]);

    const result1 = ws.decodeFrame(combined);
    assert(result1, '应先解出第一帧');
    assert.strictEqual(result1.payload.toString(), 'first');
    assert.strictEqual(result1.bytesConsumed, frame1.length);

    const result2 = ws.decodeFrame(combined.slice(result1.bytesConsumed));
    assert(result2, '应再解出第二帧');
    assert.strictEqual(result2.payload.toString(), 'second');
  });

  test('各种 mask 字节值都能正确还原', () => {
    const payload = Buffer.from('ABCDEFGH');
    const mask = Buffer.from([0xFF, 0x00, 0xAA, 0x55]);
    const masked = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i++) {
      masked[i] = payload[i] ^ mask[i % 4];
    }

    const header = Buffer.alloc(6);
    header[0] = 0x81;
    header[1] = 0x80 | payload.length;
    mask.copy(header, 2);
    const frame = Buffer.concat([header, masked]);

    const result = ws.decodeFrame(frame);
    assert.strictEqual(result.payload.toString(), 'ABCDEFGH');
  });

  // ========== 边界 ==========
  console.log('\n--- 帧尺寸边界 ---');

  test('编码恰好 65535 字节的帧（16 位上限）', () => {
    const payload = Buffer.alloc(65535, 0x45);
    const frame = ws.encodeFrame(ws.OPCODES.TEXT, payload);
    assert.strictEqual(frame[1], 126);
    assert.strictEqual(frame.readUInt16BE(2), 65535);
    assert.strictEqual(frame.length, 4 + 65535);
  });

  test('编码恰好 65536 字节的帧（64 位起点）', () => {
    const payload = Buffer.alloc(65536, 0x46);
    const frame = ws.encodeFrame(ws.OPCODES.TEXT, payload);
    assert.strictEqual(frame[1], 127);
    assert.strictEqual(Number(frame.readBigUInt64BE(2)), 65536);
    assert.strictEqual(frame.length, 10 + 65536);
  });

  test('解码 65535 字节边界帧', () => {
    const payload = 'X'.repeat(65535);
    const frame = makeClientFrame(0x01, payload);
    const result = ws.decodeFrame(frame);
    assert(result);
    assert.strictEqual(result.payload.length, 65535);
  });

  test('解码 65536 字节边界帧', () => {
    const payload = 'Y'.repeat(65536);
    const frame = makeClientFrame(0x01, payload);
    const result = ws.decodeFrame(frame);
    assert(result);
    assert.strictEqual(result.payload.length, 65536);
  });

  // ========== close 帧细节 ==========
  console.log('\n--- Close 帧细节 ---');

  test('解码带状态码的 close 帧', () => {
    const statusBuf = Buffer.alloc(2);
    statusBuf.writeUInt16BE(1000);
    const frame = makeClientFrame(0x08, statusBuf);
    const result = ws.decodeFrame(frame);
    assert.strictEqual(result.opcode, ws.OPCODES.CLOSE);
    assert.strictEqual(result.payload.readUInt16BE(0), 1000);
  });

  test('解码带状态码和原因的 close 帧', () => {
    const reason = 'Normal shutdown';
    const payload = Buffer.alloc(2 + reason.length);
    payload.writeUInt16BE(1000);
    payload.write(reason, 2);
    const frame = makeClientFrame(0x08, payload);
    const result = ws.decodeFrame(frame);
    assert.strictEqual(result.opcode, ws.OPCODES.CLOSE);
    assert.strictEqual(result.payload.slice(2).toString(), reason);
  });

  // ========== JSON 往返 ==========
  console.log('\n--- JSON 消息往返 ---');

  test('JSON 消息编码后可还原', () => {
    const msg = { type: 'reload' };
    const payload = Buffer.from(JSON.stringify(msg));
    const serverFrame = ws.encodeFrame(ws.OPCODES.TEXT, payload);

    let offset;
    if (serverFrame[1] < 126) {
      offset = 2;
    } else if (serverFrame[1] === 126) {
      offset = 4;
    } else {
      offset = 10;
    }
    const decoded = JSON.parse(serverFrame.slice(offset).toString());
    assert.deepStrictEqual(decoded, msg);
  });

  test('带 mask 的客户端 JSON 消息可正确往返', () => {
    const msg = { type: 'click', choice: 'a', text: 'Option A', timestamp: 1706000101 };
    const frame = makeClientFrame(0x01, JSON.stringify(msg));
    const result = ws.decodeFrame(frame);
    const decoded = JSON.parse(result.payload.toString());
    assert.deepStrictEqual(decoded, msg);
  });

  console.log(`\n--- 结果：${passed} 个通过，${failed} 个失败 ---`);
  if (failed > 0) process.exit(1);
}

runTests();
