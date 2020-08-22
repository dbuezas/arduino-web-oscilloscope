#include "data-struct.h"

uint8_t prescaledTicksPerADCRead;
uint8_t prescaledTicksPerADCReadTuned;
#define prescaledTicksCount TCNT2
void startCPUCounter() {
  // counter for adcREad
  TCCR2A = 0;
  TCCR2B = 0;
  if (state.ticksPerAdcRead < 256) {
    TCCR2B = 1 << CS00;
    prescaledTicksPerADCRead = state.ticksPerAdcRead;
  } else if (state.ticksPerAdcRead < 256 * 8) {
    TCCR2B = 2 << CS00;
    prescaledTicksPerADCRead = state.ticksPerAdcRead / 8;
  } else if (state.ticksPerAdcRead < 256 * 32) {
    TCCR2B = 3 << CS00;
    prescaledTicksPerADCRead = state.ticksPerAdcRead / 32;
  } else if (state.ticksPerAdcRead < 256 * 64) {
    TCCR2B = 4 << CS00;
    prescaledTicksPerADCRead = state.ticksPerAdcRead / 64;
  } else if (state.ticksPerAdcRead < 256 * 128) {
    TCCR2B = 5 << CS00;
    prescaledTicksPerADCRead = state.ticksPerAdcRead / 128;
  } else if (state.ticksPerAdcRead < 256 * 256) {
    TCCR2B = 6 << CS00;
    prescaledTicksPerADCRead = state.ticksPerAdcRead / 256;
  } else if (state.ticksPerAdcRead < 256 * 1024) {
    TCCR2B = 7 << CS00;
    prescaledTicksPerADCRead = state.ticksPerAdcRead / 1024;
  }
  prescaledTicksPerADCReadTuned =
      prescaledTicksPerADCRead - 5;  // it takes 5 clocks to update the counter
  // counter is TCNT1 and it counts cpu clocks
  prescaledTicksCount = 0;
  // con 16 bits: 51 for triggering and 47 after -> cae en 74% y deberia ser 79%
  // (79 ticks per sample)
  // con 8 bits: 48 for triggering and 44 after -> cae en 76%
  // con prescaledTicksCount = 0, llega hasta 40, pero pierde resolucion
  //
}

__attribute__((always_inline)) byte storeOne(byte channel) {
  while (prescaledTicksCount < prescaledTicksPerADCRead) {
  } /* race condition here */
  prescaledTicksCount -= prescaledTicksPerADCReadTuned;
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
  if (channel > 1) return bitRead(val2, channel);
}

__attribute__((always_inline)) void fillBufferAnalog(uint8_t channel,
                                                     TriggerDir dir) {
  uint8_t triggerPoint = state.triggerVoltage;
  byte triggerVoltageMinus = max(0, (int)triggerPoint - 2);
  byte triggerVoltagePlus = min(255, (int)triggerPoint + 2);
  uint16_t headSamples = state.triggerPos;
  uint16_t tailSamples = state.samplesPerBuffer - state.triggerPos;
  startADC();
  startCPUCounter();
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
  startCPUCounter();
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
  // got it to 57 ticks, now 55, now 58, now 56, now 49. 8bit counter = 46. 42=
  // 8 bit cunter and pure pin c 42. 43 for adc. 47 before trigger 85 is min adc
  // counter=
  uint8_t ch = state.triggerChannel;
  TriggerDir d = state.triggerDir;
  if (ch < 2)
    fillBufferAnalog(ch, d);
  else
    fillBufferDigital(ch, d);
}

void fillBuffer2() {
  startADC();
  uint16_t i = 1;
  do {
    buffer2[i] = ADCH;
    i = (i + 1) & 0b111111111;
  } while (i != 0);
  stopADC();
  state.didTrigger = 0;
  state.bufferStartPtr = 1;
}
