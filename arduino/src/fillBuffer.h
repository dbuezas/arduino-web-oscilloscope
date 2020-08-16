#include "data-struct.h"

uint16_t bufferPtr = 0;
uint8_t val;
int16_t limit;
__attribute__((always_inline)) inline void storeOne() {
  while (TCNT1 < state.ticksPerAdcRead) {
  };
  val = ADCH;
  /*
  if (state.triggerChannel==0)val = ADCH;
  else (state.triggerChannel==1)val = buffer2;
  else val = buffer3&(1<<(state.triggerChannel-3));
  */
  TCNT1 -= state.ticksPerAdcRead;  // race condition here
  buffer1[bufferPtr] = ADCH;
  buffer2[bufferPtr] = (PINB & 0b00011111) | (PIND & 0b11100000);
  buffer3[bufferPtr] =
      PIND & 0b00001111;  // the ADC reading is 1 iterations delayied
  bufferPtr++;
  if (bufferPtr == state.samplesPerBuffer) bufferPtr = 0;
  limit--;
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
  while (val > triggerVoltageMinus && limit) {
    storeOne();
  }
  while (val < state.triggerVoltage && limit) {
    storeOne();
  }
}
__attribute__((always_inline)) inline void fillBuffer_b_falling() {
  while (val < triggerVoltagePlus && limit) {
    storeOne();
  }
  while (val > state.triggerVoltage && limit) {
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
  triggerVoltageMinus = max(0, (int)state.triggerVoltage - 2);
  triggerVoltagePlus = min(255, (int)state.triggerVoltage + 2);

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
