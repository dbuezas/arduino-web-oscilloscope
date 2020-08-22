#include "data-struct.h"
uint16_t prescaledTicksPerADCRead;
uint16_t prescaledTicksPerADCReadTuned;
#define prescaledTicksCount TCNT1
void startCPUCounter() {
  // counter for adcREad
  TCCR1A = 0;
  TCCR1B = 0;
  TCCR1B = 1 << CS00;
  prescaledTicksPerADCRead = state.ticksPerAdcRead;

  prescaledTicksPerADCReadTuned =
      prescaledTicksPerADCRead -
      10;  // it takes 10 clocks to update the counter
  // counter is TCNT1 and it counts cpu clocks
  prescaledTicksCount = 0;
  // con 16 bits: 51 for triggering and 47 after -> cae en 74% y deberia ser 79%
  // (79 ticks per sample)
  // con 8 bits: 48 for triggering and 44 after -> cae en 76%
  // con prescaledTicksCount = 0, llega hasta 40, pero pierde resolucion
  // con 16 bits and correction, 61 minimum for triggering
}

__attribute__((always_inline)) byte storeOne(byte channel) {
  while (prescaledTicksCount < prescaledTicksPerADCRead) {
  }
  prescaledTicksCount -= prescaledTicksPerADCReadTuned;
  uint8_t val0 = ADCH;
  uint8_t val1 = (PINB & 0b00011111) | (PIND & 0b11100000);
  uint8_t val2 = PINC & 0b00111100;
  buffer0[state.bufferStartPtr] = val0;
  buffer1[state.bufferStartPtr] = val1;
  buffer2[state.bufferStartPtr] = val2;
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
  uint16_t headSamples = state.triggerPos + 1;
  uint16_t tailSamples = state.samplesPerBuffer - state.triggerPos - 1;
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

void fillBufferFast() {
  // test code, ugly and misses trigger on channel 1
  startCPUCounter();
  prescaledTicksCount = 0;
  startADC();

  for (uint16_t i = 0; i < MAX_SAMPLES; i++) {
    uint8_t val0 = ADCH;
    uint8_t val1 = (PINB & 0b00011111) | (PIND & 0b11100000);
    uint8_t val2 = PINC & 0b00111100;
    buffer0[i] = val0;
    buffer1[i] = val1;
    buffer2[i] = val2;
  }
  stopADC();

  state.ticksPerAdcRead = prescaledTicksCount / 512;
  uint16_t i = 0;
  if (state.triggerChannel < 2) {
    uint8_t triggerPoint = state.triggerVoltage;
    byte triggerVoltageMinus = max(0, (int)triggerPoint - 2);
    byte triggerVoltagePlus = min(255, (int)triggerPoint + 2);
    if (state.triggerDir == TriggerDir::rising) {
      while (buffer0[i] > triggerVoltageMinus && i < MAX_SAMPLES) {
        i++;
      }
      while (buffer0[i] < triggerPoint && i < MAX_SAMPLES) {
        i++;
      }
    } else {
      while (buffer0[i] < triggerVoltagePlus && i < MAX_SAMPLES) {
        i++;
      }
      while (buffer0[i] > triggerPoint && i < MAX_SAMPLES) {
        i++;
      }
    }
  } else {
    if (state.triggerDir == TriggerDir::rising) {
      while (bitRead(buffer2[i], state.triggerChannel) == 1 &&
             i < MAX_SAMPLES) {
        i++;
      }
      while (bitRead(buffer2[i], state.triggerChannel) == 0 &&
             i < MAX_SAMPLES) {
        i++;
      }
    } else {
      while (bitRead(buffer2[i], state.triggerChannel) == 0 &&
             i < MAX_SAMPLES) {
        i++;
      }
      while (bitRead(buffer2[i], state.triggerChannel) == 1 &&
             i < MAX_SAMPLES) {
        i++;
      }
    }
  }
  state.bufferStartPtr = (MAX_SAMPLES + i - state.triggerPos) % MAX_SAMPLES;
}

void fillBuffer() {
  if (state.ticksPerAdcRead < 61) {
    // not enough time for triggering
    fillBufferFast();
  } else {
    if (state.triggerChannel < 2)
      fillBufferAnalog(state.triggerChannel, state.triggerDir);
    else
      fillBufferDigital(state.triggerChannel, state.triggerDir);
  }
}
