#define TCNT3 _SFR_MEM16(0x94)
#define ICR3 _SFR_MEM16(0x96)
#include "data-struct.h"

void startCPUCounter() {
  TCCR3A = 0;
  TCCR3B = (1 << WGM33) | (1 << WGM32);  // CTC mode, counts to ICR3
  uint32_t ticksPerSample = state.secPerSample * F_CPU - 1;
  if (ticksPerSample < UINT16_MAX) {
    ICR3 = ticksPerSample;
    TCCR3B |= (1 << CS30);
  } else if (ticksPerSample / 8 < UINT16_MAX) {
    ICR3 = ticksPerSample / 8;
    TCCR3B |= (2 << CS30);
  } else if (ticksPerSample / 64 < UINT16_MAX) {
    ICR3 = ticksPerSample / 64;
    TCCR3B |= (3 << CS30);
  } else if (ticksPerSample / 256 < UINT16_MAX) {
    ICR3 = ticksPerSample / 256;
    TCCR3B |= (4 << CS30);
  } else if (ticksPerSample / 1024 < UINT16_MAX) {
    ICR3 = ticksPerSample / 1024;
    TCCR3B |= (5 << CS30);
  }
  TCNT3 = 0;
  TIFR3 = 255;  // setBit(TIFR3, OCF3A);  // clear overflow bit
}
#define FORCE_INLINE __attribute__((always_inline)) inline

FORCE_INLINE byte storeOne(byte returnChannel) {
  loop_until_bit_is_set(TIFR3, OCF3A);
  TIFR3 = 255;  // setBit(TIFR3, OCF3A);  // clear overflow bit
  uint8_t val0 = ADCH;
  uint8_t val1 = (PINB & 0b00011111) | (PIND & 0b11100000);
  uint8_t val2 = PINC & 0b00111100;
  buffer0[internalState.bufferStartPtr] = val0;
  buffer1[internalState.bufferStartPtr] = val1;
  buffer2[internalState.bufferStartPtr] = val2;
  internalState.bufferStartPtr =
      (internalState.bufferStartPtr + 1) & 0b111111111;
  if (returnChannel == 0) return val0;
  if (returnChannel == 1) return val1;
  return bitRead(val2, returnChannel);
}
void fillBufferAnalogTrigger(uint8_t channel, TriggerDir dir) {
  uint8_t triggerPoint = state.triggerVoltage;
  byte triggerVoltageMinus = max(0, (int)triggerPoint - 2);
  byte triggerVoltagePlus = min(255, (int)triggerPoint + 2);
  uint16_t headSamples = state.triggerPos;
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

void fillBufferDigitalTrigger(uint8_t channel, TriggerDir dir) {
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

uint16_t autoInterruptOverflows;
void setupAutoInterrupt() {
  TIMSK1 = 0;
  TCCR1A = 0;
  TCCR1B = 5 << CS10;      // 1024 prescaler
  TCCR1B |= (1 << WGM12);  // turn on CTC mode
  int prescaler = 1024;

  float secondsPerFrame = (state.secPerSample * state.samplesPerBuffer) +
                          10 / 1000.0;  // added 10ms of wait time
  float ticksPerFrame = secondsPerFrame * F_CPU / prescaler;

  uint32_t timeoutTicks = ceil(ticksPerFrame * 2.5);

  autoInterruptOverflows = timeoutTicks / 65536;
  uint16_t timeoutTicksCycle = timeoutTicks % 65536;
  OCR1A = timeoutTicksCycle;  // will interrupt when this value is reached
  TCNT1 = 0;                  // counter reset

  TIMSK1 |= (1 << OCIE1A);  // enable ISR
}

void offAutoInterrupt() {
  // TIMSK1 = 0;
  // TCCR1A = 0;
  TCCR1B = 0;
}

jmp_buf envAutoTimeout;
void fillBuffer() {
  if (state.triggerMode == TriggerMode::slow) {
    if (internalState.inputChanged) {
      internalState.inputChanged = false;
      startADC();
      startCPUCounter();
      const int FPS = 30;  // try to achive 25 frames per second
      float samplesPerSecond = 1 / state.secPerSample;
      state.sentSamples = samplesPerSecond / FPS;
      if (state.sentSamples < 1) state.sentSamples = 1;
      if (state.sentSamples > state.samplesPerBuffer - 1)
        state.sentSamples = state.samplesPerBuffer - 1;
    }
    uint16_t bufferStart = internalState.bufferStartPtr;
    for (uint16_t i = state.sentSamples; i > 0; i--) storeOne(0);
    internalState.bufferStartPtr = bufferStart;
    return;
  }
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

  state.sentSamples = state.samplesPerBuffer;

  if (state.triggerChannel < 2)
    fillBufferAnalogTrigger(state.triggerChannel, (TriggerDir)state.triggerDir);
  else
    fillBufferDigitalTrigger(state.triggerChannel,
                             (TriggerDir)state.triggerDir);
  state.didTrigger = true;

  offAutoInterrupt();
}

ISR(TIMER1_COMPA_vect) {
  if (autoInterruptOverflows == 0) longjmp(envAutoTimeout, 1);
  autoInterruptOverflows--;
}
