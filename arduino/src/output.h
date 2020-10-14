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
void sendBuffer(uint8_t buffer[]) {
  uint16_t ptr = internalState.bufferStartPtr;
  for (uint16_t i = 0; i < state.sentSamples; i++) {
    write(buffer[ptr]);
    ptr++;
    if (ptr == state.samplesPerBuffer) ptr = 0;
  }
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