#include "data-struct.h"

uint8_t triggerVal;
uint8_t triggerPoint;
uint8_t digitalTriggerMask;
// uint16_t limit;

__attribute__((always_inline)) inline void storeOne() {
  while (TCNT1 < state.ticksPerAdcRead) {
  };
  TCNT1 -= state.ticksPerAdcRead -
           9;  // race condition here (this operation actually takes 9 clocks)
  uint8_t val0 = ADCH;
  uint8_t val1 = (PINB & 0b00011111) | (PIND & 0b11100000);
  uint8_t val2 = PINC & 0b00111100;

  switch (state.triggerChannel) {
    case 0: {
      triggerVal = val0;
      break;
    }
    case 1: {
      triggerVal = val1;
      break;
    }
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8: {
      triggerVal = val2 & digitalTriggerMask;
      break;
    }
  }

  buffer0[state.bufferStartPtr] = val0;
  buffer1[state.bufferStartPtr] = val1;
  buffer2[state.bufferStartPtr] = val2;
  state.bufferStartPtr++;
  if (state.bufferStartPtr == state.samplesPerBuffer) state.bufferStartPtr = 0;
  // if (state.triggerMode == TriggerMode::autom) limit--;
  // if (Serial.peek() != -1) limit = 0;
}

uint8_t triggerVoltageMinus;
uint8_t triggerVoltagePlus;
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
  while (triggerVal > triggerVoltageMinus) {
    storeOne();
  }
  while (triggerVal < triggerPoint) {
    storeOne();
  }
}
__attribute__((always_inline)) inline void fillBuffer_b_falling() {
  while (triggerVal < triggerVoltagePlus) {
    storeOne();
  }
  while (triggerVal > triggerPoint) {
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
  triggerPoint = state.triggerVoltage;
  triggerVoltageMinus = max(0, (int)triggerPoint - 2);
  triggerVoltagePlus = min(255, (int)triggerPoint + 2);
  digitalTriggerMask = 0;

  if (state.triggerChannel > 1) {
    digitalTriggerMask = (1 << (state.triggerChannel - 2));
    triggerVoltageMinus = 0;
    triggerVoltagePlus = 1;
    if (state.triggerDir == TriggerDir::rising) {
      triggerPoint = 1;
    } else {
      triggerPoint = 0;
    }
  }
  // limit = state.samplesPerBuffer * 10;
  headSamples = state.triggerPos;
  tailSamples = state.samplesPerBuffer - state.triggerPos;

  if (state.triggerDir == TriggerDir::rising) {
    fillBuffer_a();
    fillBuffer_b_rising();
    fillBuffer_c();
  } else {
    fillBuffer_a();
    fillBuffer_b_falling();
    fillBuffer_c();
  }
  stopADC();
  // state.didTrigger = limit > 0;
  // it is a circular buffer, so the beginning is right after the end
  // state.bufferStartPtr = state.bufferStartPtr;
}
// void fillBufferFast() {
//   startADC();
//   for (bufferPtr = 0; bufferPtr != state.samplesPerBuffer; bufferPtr++) {
//     while (TCNT1 < state.ticksPerAdcRead) {
//     };
//     TCNT1 -= state.ticksPerAdcRead;  // race condition here
//     buffer0[bufferPtr] = ADCH;
//     buffer1[bufferPtr] = (PINB & 0b00011111) | (PIND & 0b11100000);
//     buffer2[bufferPtr] = PIND & 0b00001111;
//   }
//   stopADC();
//   state.didTrigger = 0;
//   state.bufferStartPtr = 0;
// }
