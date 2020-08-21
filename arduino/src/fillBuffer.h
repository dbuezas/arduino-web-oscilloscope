#include "data-struct.h"

uint8_t triggerVal;
// uint16_t limit;

__attribute__((always_inline)) byte storeOne(byte channel) {
  while (TCNT1 < state.ticksPerAdcRead) {
  } /* race condition here (what's with the 7 clocks?) */
  TCNT1 -= state.ticksPerAdcRead - 7;
  uint8_t val0 = ADCH;
  uint8_t val1 = (PINB & 0b00011111) | (PIND & 0b11100000);
  uint8_t val2 = PINC & 0b00111100;
  buffer0[state.bufferStartPtr] = val0;
  buffer1[state.bufferStartPtr] = val1;
  buffer2[state.bufferStartPtr] =
      val2; /* masking against 512-1 so max is 512 == MAX_SAMPLES */
  state.bufferStartPtr = (state.bufferStartPtr + 1) & 0b111111111;
  if (channel == 0) return val0;
  if (channel == 1) return val1;
  if (channel > 1) return val2 & (1 << channel);
}

__attribute__((always_inline)) void fillBufferAnalog(uint8_t channel,
                                                     TriggerDir dir) {
  uint8_t triggerPoint = state.triggerVoltage;
  byte triggerVoltageMinus = max(0, (int)triggerPoint - 2);
  byte triggerVoltagePlus = min(255, (int)triggerPoint + 2);
  uint16_t headSamples = state.triggerPos;
  uint16_t tailSamples = state.samplesPerBuffer - state.triggerPos;
  startADC();
  TCNT1 = 0;
  while (headSamples--) {
    storeOne(channel);
  }
  if (dir == TriggerDir::rising) {
    while (storeOne(channel) > triggerVoltageMinus) {
    }
    while (storeOne(channel) < triggerPoint) {
    }
  } else {
    while (storeOne(channel) < triggerVoltagePlus) {
    }
    while (storeOne(channel) > triggerPoint) {
    }
  }
  while (tailSamples--) {
    storeOne(channel);
  }
  stopADC();
}

__attribute__((always_inline)) inline void fillBufferDigital(uint8_t channel,
                                                             TriggerDir dir) {
  uint16_t headSamples = state.triggerPos;
  uint16_t tailSamples = state.samplesPerBuffer - state.triggerPos;
  startADC();
  TCNT1 = 0;
  while (headSamples--) {
    storeOne(channel);
  }
  if (dir == TriggerDir::rising) {
    while (storeOne(channel) == 1) {
    }
    while (storeOne(channel) == 0) {
    }
  } else {
    while (storeOne(channel) == 0) {
    }
    while (storeOne(channel) == 1) {
    }
  }
  while (tailSamples--) {
    storeOne(channel);
  }
  stopADC();
}

void fillBuffer() {
  // got it to 57 ticks, now 55, now 58, now 56
  uint8_t ch = state.triggerChannel;
  TriggerDir d = state.triggerDir;
  if (ch < 2)
    fillBufferAnalog(ch, d);
  else
    fillBufferAnalog(ch, d);
  return;
  // if (d == TriggerDir::falling) {
  //   if (ch == 0) fillBufferAnalog(ch, d);
  //   if (ch == 1) fillBufferAnalog(ch, d);
  //   if (ch == 2) fillBufferDigital(ch, d);
  //   if (ch == 3) fillBufferDigital(ch, d);
  //   if (ch == 4) fillBufferDigital(ch, d);
  //   if (ch == 5) fillBufferDigital(ch, d);
  // } else if (d == TriggerDir::rising) {
  //   if (ch == 0) fillBufferAnalog(ch, d);
  //   if (ch == 1) fillBufferAnalog(ch, d);
  //   if (ch == 2) fillBufferDigital(ch, d);
  //   if (ch == 3) fillBufferDigital(ch, d);
  //   if (ch == 4) fillBufferDigital(ch, d);
  //   if (ch == 5) fillBufferDigital(ch, d);
  // }
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
