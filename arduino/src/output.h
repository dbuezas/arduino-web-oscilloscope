#include "data-struct.h"

void sendBuffer(uint8_t buffer[]) {
  uint16_t count = state.samplesPerBuffer - state.trashedSamples;
  uint16_t i = state.bufferStartPtr;
  while (count) {
    Serial.write(buffer[i]);
    i = (i + 1) & 0b111111111;
    count--;
  }
}

void sendData(bool withBuffers = true) {
  digitalWrite(D13, 1);
  Serial.write((byte*)&state, sizeof(state));
  if (withBuffers) {
    if (state.isChannelOn & 0b1) sendBuffer(buffer0);
    if (state.isChannelOn & 0b10) sendBuffer(buffer1);
    if (state.isChannelOn & 0b00111100) sendBuffer(buffer2);
  }

  Serial.write((byte*)&endOfMessage, sizeof(endOfMessage));
  state.forceUIUpdate = false;
  Serial.flush();  // send all now to avoid interrupts while sampling
  digitalWrite(D13, 0);
}
