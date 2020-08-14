#include "MemoryFree.h"
#include "data-struct.h"

uint16_t WritePtr = 0;
uint8_t val;
int16_t limit;
__attribute__((always_inline)) inline void storeOne() {
  while (TCNT1 < state.clocksPerAdcRead) {
  };
  val = ADCH;
  TCNT1 -= state.clocksPerAdcRead;
  Buffer1[WritePtr] = val;
  Buffer2[WritePtr] = (PINB & 0b00011111) | (PIND & 0b11100000);
  Buffer3[WritePtr] =
      PIND & 0b00001111;  // the ADC reading is 1 iterations delayied
  WritePtr++;
  if (WritePtr == state.samples) WritePtr = 0;
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
  state.triggerPtr = WritePtr;
  // fill buffer
  while (tailSamples--) {
    storeOne();
  }
  stopADC();
  state.didTrigger = limit > 0;
}
void fillBuffer() {
  // trying to reduce checks once readings begin by hoisting the if for the
  // triggerDir
  triggerVoltageIntMinus = max(0, (int)state.triggerVoltageInt - 2);
  triggerVoltageIntPlus = min(255, (int)state.triggerVoltageInt + 2);

  limit = state.samples * 10;
  headSamples = state.triggerPos;
  tailSamples = state.samples - state.triggerPos;

  if (state.triggerDir == TriggerDir::rising) {
    fillBuffer_a();
    fillBuffer_b_rising();
    fillBuffer_c();
  } else {
    fillBuffer_a();
    fillBuffer_b_falling();
    fillBuffer_c();
  }
}

void sendBuffer() {
  state.freeMemoryAvailable = freeMemory();

  Serial.write((byte*)&state.prelude, sizeof(state.prelude));
  Serial.write((byte*)&state, sizeof(state));
  if (state.Buffer1_ON) Serial.write((byte*)&Buffer1, sizeof(Buffer1));
  if (state.Buffer2_ON) Serial.write((byte*)&Buffer2, sizeof(Buffer2));
  if (state.Buffer3_ON) Serial.write((byte*)&Buffer3, sizeof(Buffer3));
  Serial.flush();  // send all now to avoid interrupts while sampling
}