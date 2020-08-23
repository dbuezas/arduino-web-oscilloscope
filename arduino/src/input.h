#include "MemoryFree.h"
#include "data-struct.h"

void saveInput(char option, int16_t val) {
  switch (option) {
    case 'C':
      state.ticksPerAdcRead = val;
      break;
    case 'V':
      state.triggerVoltage = constrain(val, 0, 255);
      break;
    case 'P':
      state.triggerPos = constrain(val, 0, state.samplesPerBuffer);
      break;
    case 'S':
      state.samplesPerBuffer = constrain(val, 1, MAX_SAMPLES);
      state.triggerPos = constrain(state.triggerPos, 1, state.samplesPerBuffer);
      break;
    case 'D':
      state.triggerDir = constrain(val, 0, 1);
      break;
    case '0':
      state.isbuffer0ON = constrain(val, 0, 1);
      break;
    case '1':
      state.isbuffer1ON = constrain(val, 0, 1);
      break;
    case '2':
      state.isbuffer2ON = constrain(val, 0, 1);
      break;
    case 'M':
      state.triggerMode = constrain(val, 0, 2);
      // AUTO, TRIGGER, SLOW
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
