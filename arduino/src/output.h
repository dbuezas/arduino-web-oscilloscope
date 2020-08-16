#include "MemoryFree.h"
#include "data-struct.h"

void sendBuffer() {
  state.freeMemory = freeMemory();

  Serial.write((byte*)&state.prelude, sizeof(state.prelude));
  Serial.write((byte*)&state, sizeof(state));
  if (state.isBuffer1ON) Serial.write((byte*)&buffer1, sizeof(buffer1));
  if (state.isBuffer2ON) Serial.write((byte*)&buffer2, sizeof(buffer2));
  if (state.isBuffer3ON) Serial.write((byte*)&buffer3, sizeof(buffer3));
  Serial.flush();  // send all now to avoid interrupts while sampling
}