#include "data-struct.h"

// void sendData() {
//   Serial.write((byte*)&state, sizeof(state));
//   if (state.isbuffer0ON) Serial.write((byte*)&buffer0, sizeof(buffer0));
//   if (state.isbuffer1ON) Serial.write((byte*)&buffer1, sizeof(buffer1));
//   if (state.isbuffer2ON) Serial.write((byte*)&buffer2, sizeof(buffer2));
//   Serial.write((byte*)&prelude, sizeof(prelude));
//   Serial.flush();  // send all now to avoid interrupts while sampling
//   state.forceUIUpdate = false;
// }

void sendData(bool withBuffers = true) {
  Serial.write((byte*)&state, sizeof(state));
  if (withBuffers) {
    if (state.isbuffer0ON) Serial.write((byte*)&buffer0, sizeof(buffer0));
    if (state.isbuffer1ON) Serial.write((byte*)&buffer1, sizeof(buffer1));
    if (state.isbuffer2ON) Serial.write((byte*)&buffer2, sizeof(buffer2));
  }

  Serial.write((byte*)&prelude, sizeof(prelude));
  Serial.flush();  // send all now to avoid interrupts while sampling
  state.forceUIUpdate = false;
}
