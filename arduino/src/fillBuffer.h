#include "data-struct.h"

uint8_t triggerVal;
// uint16_t limit;
#define storeOneMACRO(channel)                                       \
  __attribute__((always_inline)) inline void storeOne_##channel() {  \
    while (TCNT1 < state.ticksPerAdcRead) {                          \
    }                                                                \
    /* race condition here (what's with the 7 clocks?) */            \
    TCNT1 -= state.ticksPerAdcRead - 7;                              \
    uint8_t val0 = ADCH;                                             \
    uint8_t val1 = (PINB & 0b00011111) | (PIND & 0b11100000);        \
    uint8_t val2 = PINC & 0b00111100;                                \
    if (channel == 0) triggerVal = val0;                             \
    if (channel == 1) triggerVal = val1;                             \
    if (channel > 1) triggerVal = val2 & (1 << channel);             \
    buffer0[state.bufferStartPtr] = val0;                            \
    buffer1[state.bufferStartPtr] = val1;                            \
    buffer2[state.bufferStartPtr] = val2;                            \
    /* masking against 512-1 so max is 512 == MAX_SAMPLES */         \
    state.bufferStartPtr = (state.bufferStartPtr + 1) & 0b111111111; \
  }

#define fillBufferMACROAnalog(channel, dir)                           \
  void fillBuffer_##channel##_##dir() {                               \
    uint8_t triggerPoint = state.triggerVoltage;                      \
    byte triggerVoltageMinus = max(0, (int)triggerPoint - 2);         \
    byte triggerVoltagePlus = min(255, (int)triggerPoint + 2);        \
    uint16_t headSamples = state.triggerPos;                          \
    uint16_t tailSamples = state.samplesPerBuffer - state.triggerPos; \
    startADC();                                                       \
    TCNT1 = 0;                                                        \
    while (headSamples--) {                                           \
      storeOne_##channel();                                           \
    }                                                                 \
    if (TriggerDir::dir == TriggerDir::rising) {                      \
      do {                                                            \
        storeOne_##channel();                                         \
      } while (triggerVal > triggerVoltageMinus);                     \
      do {                                                            \
        storeOne_##channel();                                         \
      } while (triggerVal < triggerPoint);                            \
    } else {                                                          \
      do {                                                            \
        storeOne_##channel();                                         \
      } while (triggerVal < triggerVoltagePlus);                      \
      do {                                                            \
        storeOne_##channel();                                         \
      } while (triggerVal > triggerPoint);                            \
    }                                                                 \
    while (tailSamples--) {                                           \
      storeOne_##channel();                                           \
    }                                                                 \
    stopADC();                                                        \
  }
#define fillBufferMACRODigital(channel, dir)                          \
  void fillBuffer_##channel##_##dir() {                               \
    uint16_t headSamples = state.triggerPos;                          \
    uint16_t tailSamples = state.samplesPerBuffer - state.triggerPos; \
    startADC();                                                       \
    TCNT1 = 0;                                                        \
    while (headSamples--) {                                           \
      storeOne_##channel();                                           \
    }                                                                 \
    if (TriggerDir::dir == TriggerDir::rising) {                      \
      do {                                                            \
        storeOne_##channel();                                         \
      } while (triggerVal == 1);                                      \
      do {                                                            \
        storeOne_##channel();                                         \
      } while (triggerVal == 0);                                      \
    } else {                                                          \
      do {                                                            \
        storeOne_##channel();                                         \
      } while (triggerVal == 0);                                      \
      do {                                                            \
        storeOne_##channel();                                         \
      } while (triggerVal == 1);                                      \
    }                                                                 \
    while (tailSamples--) {                                           \
      storeOne_##channel();                                           \
    }                                                                 \
    stopADC();                                                        \
  }

storeOneMACRO(0);
storeOneMACRO(1);
storeOneMACRO(2);
storeOneMACRO(3);
storeOneMACRO(4);
storeOneMACRO(5);

fillBufferMACROAnalog(0, rising);
fillBufferMACROAnalog(1, rising);
fillBufferMACRODigital(2, rising);
fillBufferMACRODigital(3, rising);
fillBufferMACRODigital(4, rising);
fillBufferMACRODigital(5, rising);

fillBufferMACROAnalog(0, falling);
fillBufferMACROAnalog(1, falling);
fillBufferMACRODigital(2, falling);
fillBufferMACRODigital(3, falling);
fillBufferMACRODigital(4, falling);
fillBufferMACRODigital(5, falling);

#define fillMacro(channel, dir)                                               \
  if (state.triggerChannel == channel && state.triggerDir == TriggerDir::dir) \
  fillBuffer_##channel##_##dir()

void fillBuffer() {
  // got it to 57 ticks
  fillMacro(0, falling);
  fillMacro(1, falling);
  fillMacro(2, falling);
  fillMacro(3, falling);
  fillMacro(4, falling);
  fillMacro(5, falling);

  fillMacro(0, rising);
  fillMacro(1, rising);
  fillMacro(2, rising);
  fillMacro(3, rising);
  fillMacro(4, rising);
  fillMacro(5, rising);
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
