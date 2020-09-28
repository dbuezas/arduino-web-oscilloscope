#include "MemoryFree.h"
#include "data-struct.h"

void saveInput(char option, float val) {
  state.needData = false;
  switch (option) {
    case 'C':
      state.secPerSample = val;
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

/*
  It is a pitty that I need to have my own buffer on top of the circular buffer
  that HardwareSerial has. This is because there is no method to read that
  buffer without consuming it.
*/
#define INPUT_BUFFER_SIZE 35
char inputBuffer[INPUT_BUFFER_SIZE];
byte ptr = 0;
bool handleInput() {
  bool change = false;
  while (Serial.available()) {
    int s = Serial.read();
    if (s == '>') {
      char option = inputBuffer[0];
      float val = atof(inputBuffer + 1);
      state.freeMemory = freeMemory();
      ptr = 0;
      inputBuffer[ptr] = 0;

      saveInput(option, val);
      change = true;
    } else {
      if (ptr >= INPUT_BUFFER_SIZE - 1) {
        // don't write outside the array
        // this is actually an exception.
        ptr = 0;
      }
      inputBuffer[ptr] = (char)s;
      ptr++;
      inputBuffer[ptr] = 0;
    }
  }
  return change;
}
