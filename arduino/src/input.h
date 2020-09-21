#include "MemoryFree.h"
#include "data-struct.h"

void saveInput(char option, int16_t val) {
  state.needData = false;
  switch (option) {
    case 'C':
      state.ticksPerAdcRead = val;
      break;
    case 'V':
      state.triggerVoltage = constrain(val, 0, 255);
      break;
    case 'A':
      state.amplifier = constrain(val, 0, 11);
      break;
    case 'P':
      state.triggerPos = constrain(val, 0, state.samplesPerBuffer - 1);
      break;
    case 'S':
      state.samplesPerBuffer = constrain(val, 1, MAX_SAMPLES);
      state.triggerPos = constrain(state.triggerPos, 1, state.samplesPerBuffer);
      break;
    case 'D':
      state.triggerDir = constrain(val, 0, 1);
      break;
    case 'B':
      state.isChannelOn = val;
      break;
    case 'M':
      state.triggerMode = constrain(val, 0, 3);
      // AUTO, NORMAL, SINGLE, SLOW
      break;
    case 'T':
      state.triggerChannel = constrain(val, 0, 5);
      break;
  }
}

String inputBuffer = String("");
bool handleInput() {
  bool change = false;
  while (Serial.available()) {
    int s = Serial.read();
    if (s == '>') {
      char option = inputBuffer.charAt(0);
      int16_t val = inputBuffer.substring(1).toInt();
      state.freeMemory = freeMemory();
      inputBuffer = String("");
      saveInput(option, val);
      change = true;
    } else {
      inputBuffer += (char)s;
    }
  }
  return change;
}
