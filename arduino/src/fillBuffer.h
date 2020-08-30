#define TCNT3 _SFR_MEM16(0x94)

#include "data-struct.h"
uint16_t prescaledTicksPerADCRead;
uint16_t prescaledTicksPerADCReadTuned;

#define prescaledTicksCount TCNT3
void startCPUCounter() {
  // counter for adcREad
  TCCR3A = 0;
  TCCR3B = 0;
  TCCR3B = 1 << CS30;
  prescaledTicksPerADCRead = state.ticksPerAdcRead;
  /* There are 10 cycles between putting the (16 bit) current counter in 2
   * registers, subtracting a (16 bit) number and storing them back. These 10
   * "lost" cycles are added back by the "tuned" prescaler.
   *
   * There are another 9 cycles to get out of the while loop, so a total of 19
   * cycles of overhead by the busy loop.
   *
   * An interrupt would consume ~52 cycles (in avr) according to
   * https://billgrundmann.wordpress.com/2009/03/02/the-overhead-of-arduino-interrupts/
   *
   * A naked ISR would take 11 cycles (in an avr) according to this
   * https://forum.arduino.cc/index.php?topic=157279.msg1182820#msg1182820
   * potentially even 8 ticks by reactivating
   * interrupts and then just busy looping instead of calling reti.
   * So there is a faster way. Full 0,00000025 seconds faster.
   *
   * This would take it from ~63 cycles to ~54 cycles digital sample. Who cares!
   */
  prescaledTicksPerADCReadTuned = prescaledTicksPerADCRead - 10;
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
  uint16_t headSamples = state.triggerPos;
  uint16_t tailSamples = state.samplesPerBuffer - state.triggerPos;
  startADC(2, state.amplifier);
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
  startADC(2, state.amplifier);
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
  bool done;
  do {
    prescaledTicksCount = 0;
    startADC(1, state.amplifier);
    for (uint16_t i = 0; i < MAX_SAMPLES; i++) {
      uint8_t val0 = ADCH;
      uint8_t val1 = (PINB & 0b00011111) | (PIND & 0b11100000);
      uint8_t val2 = PINC & 0b00111100;
      buffer0[i] = val0;
      buffer1[i] = val1;
      buffer2[i] = val2;
    }
    state.ticksPerAdcRead = prescaledTicksCount / 512;
    state.forceUIUpdate = true;
    stopADC();

    // start looking after the trigger pos to minimize waste
    uint16_t i = state.triggerPos;
    if (state.triggerChannel < 2) {
      uint8_t triggerPoint = state.triggerVoltage;
      byte triggerVoltageMinus = max(0, (int)triggerPoint - 10);
      byte triggerVoltagePlus = min(255, (int)triggerPoint + 10);
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
    done = i < MAX_SAMPLES;
    if (done) {
      state.bufferStartPtr = (MAX_SAMPLES + i - state.triggerPos) % MAX_SAMPLES;
    }
    state.trashedSamples = i - state.triggerPos;
  } while (!done);
}

void offAutoInterrupt() {
  TIMSK1 = 0;
  TCCR1A = 0;
  TCCR1B = 0;
}
void setupAutoInterrupt() {
  TIMSK1 = 0;
  TCCR1A = 0;
  TCCR1B = 5 << CS10;      // 1024 prescaler
  TCCR1B |= (1 << WGM12);  // turn on CTC mode
  int prescaler = 1024;
  unsigned long ticksPerFrame = (unsigned long)state.ticksPerAdcRead *
                                state.samplesPerBuffer /
                                prescaler;  //  max is 4,294,967,295 (2^32 - 1).
  uint16_t overhead = 100;                  // 100*1024/32000000=3.2ms
  uint16_t timeoutTicks =
      min((unsigned long)ticksPerFrame * 2 + overhead, (unsigned long)65025);
  OCR1A = timeoutTicks;  // will interrupt when this value is reached
  TCNT1 = 0;             // counter reset

  TIMSK1 |= (1 << OCIE1A);  // enable ISR
}
jmp_buf envAutoTimeout;
void fillBuffer() {
  if (state.triggerMode == TriggerMode::autom) {
    bool didTimeout = setjmp(envAutoTimeout);
    if (didTimeout) {
      offAutoInterrupt();
      state.didTrigger = false;
      return;
    } else {
      setupAutoInterrupt();
    }
  }
  if (state.ticksPerAdcRead < 61) {
    // not enough time for triggering
    fillBufferFast();
  } else {
    state.trashedSamples = 0;

    if (state.triggerChannel < 2)
      fillBufferAnalog(state.triggerChannel, state.triggerDir);
    else
      fillBufferDigital(state.triggerChannel, state.triggerDir);
    state.didTrigger = true;
  }
  offAutoInterrupt();
}

ISR(TIMER1_COMPA_vect) { longjmp(envAutoTimeout, 1); }
