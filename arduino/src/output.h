#include "MemoryFree.h"
#include "data-struct.h"

uint16_t bufferPtr = 0;
uint8_t val;
int16_t limit;
__attribute__((always_inline)) inline void storeOne() {
  while (TCNT1 < state.clocksPerAdcRead) {
  };
  val = ADCH;
  TCNT1 -= state.clocksPerAdcRead;
  buffer1[bufferPtr] = val;
  buffer2[bufferPtr] = (PINB & 0b00011111) | (PIND & 0b11100000);
  buffer3[bufferPtr] =
      PIND & 0b00001111;  // the ADC reading is 1 iterations delayied
  bufferPtr++;
  if (bufferPtr == state.samplesPerBuffer) bufferPtr = 0;
  limit--;
}

uint8_t triggerVoltageIntMinus;
uint8_t triggerVoltageIntPlus;
uint16_t headSamples;
uint16_t tailSamples;

__attribute__((always_inline)) inline void fillBuffer_a() {
  // fill until triggerPos
  startADC();
  TCNT1 = 0;
  while (headSamples--) {
    storeOne();
  }
}
__attribute__((always_inline)) inline void fillBuffer_b_rising() {
  while (val > triggerVoltageIntMinus && limit) {
    storeOne();
  }
  while (val < state.triggerVoltageInt && limit) {
    storeOne();
  }
}
__attribute__((always_inline)) inline void fillBuffer_b_falling() {
  while (val < triggerVoltageIntPlus && limit) {
    storeOne();
  }
  while (val > state.triggerVoltageInt && limit) {
    storeOne();
  }
}
__attribute__((always_inline)) inline void fillBuffer_c() {
  // trigger point found
  // fill buffer
  while (tailSamples--) {
    storeOne();
  }
}
void fillBuffer() {
  // trying to reduce checks once readings begin by hoisting the if for the
  // triggerDir
  triggerVoltageIntMinus = max(0, (int)state.triggerVoltageInt - 2);
  triggerVoltageIntPlus = min(255, (int)state.triggerVoltageInt + 2);

  limit = state.samplesPerBuffer * 10;
  headSamples = state.triggerPos;
  tailSamples = state.samplesPerBuffer - state.triggerPos;

  // __asm__ volatile("nop\n");  // don't move code around please

  if (state.triggerDir == TriggerDir::rising) {
    fillBuffer_a();
    fillBuffer_b_rising();
    fillBuffer_c();
  } else {
    fillBuffer_a();
    fillBuffer_b_falling();
    fillBuffer_c();
  }
  // __asm__ volatile("nop\n");  // don't move code around please
  stopADC();
  state.didTrigger = limit > 0;
  // it is a circular buffer, so the beginning is right after the end
  state.bufferStartPtr = bufferPtr;
}

void sendBuffer() {
  state.freeMemory = freeMemory();

  Serial.write((byte*)&state.prelude, sizeof(state.prelude));
  Serial.write((byte*)&state, sizeof(state));
  if (state.isBuffer1ON) Serial.write((byte*)&buffer1, sizeof(buffer1));
  if (state.isBuffer2ON) Serial.write((byte*)&buffer2, sizeof(buffer2));
  if (state.isBuffer3ON) Serial.write((byte*)&buffer3, sizeof(buffer3));
  Serial.flush();  // send all now to avoid interrupts while sampling
}