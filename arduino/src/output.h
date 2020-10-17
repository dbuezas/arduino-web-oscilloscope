#ifndef OUTPUT_H
#define OUTPUT_H

#include "data-struct.h"

uint16_t checksum;
void write(uint8_t c) {
  checksum += c;
  Serial.write(c);
}
size_t write(const uint8_t* c, size_t length) {
  Serial.write(c, length);
  for (uint16_t i = 0; i < length; i++) {
    checksum += c[i];
  }
  return length;
}

float log2(float n) { return log(n) / log(2); }
void sendBuffer(uint8_t buffer[]) {
  uint16_t ptr = internalState.bufferStartPtr;

  int8_t minDelta = 127;
  int8_t maxDelta = -127;

  uint8_t last = buffer[ptr];
  for (uint16_t i = 0; i < state.sentSamples; i++) {
    int16_t delta = buffer[ptr] - last;
    last = buffer[ptr];
    if (delta < -128) delta += 256;
    if (delta > 127) delta -= 256;
    minDelta = min(minDelta, delta);
    maxDelta = max(maxDelta, delta);
    ptr++;
    if (ptr == state.samplesPerBuffer) ptr = 0;
  }
  uint8_t bitsPerDelta = ceil(log2(1 + maxDelta - minDelta));
  if (bitsPerDelta == 0) bitsPerDelta = 1;

  ptr = internalState.bufferStartPtr;
  last = buffer[ptr];
  write(last);
  write(minDelta);
  write(bitsPerDelta);
  uint16_t twoBytes = 0;
  uint8_t position = 0;
  for (uint16_t i = 0; i < state.sentSamples; i++) {
    int16_t delta = buffer[ptr] - last;
    last = buffer[ptr];
    if (delta < -128) delta += 256;
    if (delta > 127) delta -= 256;
    uint8_t offsettedDelta = delta - minDelta;
    twoBytes |= offsettedDelta << position;
    position += bitsPerDelta;
    if (position >= 8) {
      uint8_t lowerByte = twoBytes;
      write(lowerByte);
      twoBytes = twoBytes >> 8;
      position -= 8;
    };
    ptr++;
    if (ptr == state.samplesPerBuffer) ptr = 0;
  }
  if (position > 0) write((uint8_t)twoBytes);
}

void sendData(bool withBuffers = true) {
  checksum = 0;
  digitalWrite(D13, 1);
  write((uint8_t*)&state, sizeof(state));
  if (withBuffers) {
    if (state.isChannelOn & 0b1) sendBuffer(buffer0);
    if (state.isChannelOn & 0b10) sendBuffer(buffer1);
    if (state.isChannelOn & 0b00111100) sendBuffer(buffer2);
  }
  Serial.write((uint8_t*)&checksum, sizeof(checksum));
  Serial.write((uint8_t*)&endOfMessage, sizeof(endOfMessage));
  state.forceUIUpdate = false;
  Serial.flush();  // send all now to avoid interrupts while sampling
  digitalWrite(D13, 0);
}

#endif