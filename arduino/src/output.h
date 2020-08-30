#include "data-struct.h"

void sendData(bool withBuffers = true) {
  Serial.write((byte*)&state, sizeof(state));
  if (withBuffers) {
    if (state.isChannelOn & 0b1) Serial.write((byte*)&buffer0, sizeof(buffer0));
    if (state.isChannelOn & 0b10)
      Serial.write((byte*)&buffer1, sizeof(buffer1));
    if (state.isChannelOn & 0b11111100)
      Serial.write((byte*)&buffer2, sizeof(buffer2));
  }

  Serial.write((byte*)&endOfMessage, sizeof(endOfMessage));
  Serial.flush();  // send all now to avoid interrupts while sampling
  state.forceUIUpdate = false;
}
