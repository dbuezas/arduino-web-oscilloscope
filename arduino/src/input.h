#include "data-struct.h"

void handleInput() {
  while (Serial.available() > 2) {
    char option = Serial.read();
    String value = Serial.readStringUntil('>');
    if (value.length() == 0) return;
    int val = value.toInt();
    if (option == 'C') {
      state.ticksPerAdcRead = val;
    }
    if (option == 'V') {
      state.triggerVoltageInt = constrain(val, 0, 255);
    }
    if (option == 'P') {
      state.triggerPos = constrain(val, 1, state.samplesPerBuffer);
    }
    if (option == 'S') {
      state.samplesPerBuffer = constrain(val, 1, MAX_SAMPLES);
      state.triggerPos = constrain(state.triggerPos, 1, state.samplesPerBuffer);
    }
    if (option == 'D') {
      val = constrain(val, 0, 1);
      state.triggerDir = val;
    }
    if (option == '1') {
      val = constrain(val, 0, 1);
      state.isBuffer1ON = val;
    }
    if (option == '2') {
      val = constrain(val, 0, 1);
      state.isBuffer2ON = val;
    }
    if (option == '3') {
      val = constrain(val, 0, 1);
      state.isBuffer3ON = val;
    }
    if (option == 'M') {
      val = constrain(val, 0, 2);
      state.triggerMode = val;
      // AUTO, TRIGGER, SLOW
    }
    if (option == 'T') {
      val = constrain(val, 0, 10);
      state.triggerChannel = val;
    }
  }
}

// void send_uint8(uint8_t v) { Serial.write(v); }
// void send_int16(int16_t v) {
//   Serial.write(lowByte(v));
//   Serial.write(highByte(v));
// }
// void send_uint16(uint16_t v) {
//   Serial.write(lowByte(v));
//   Serial.write(highByte(v));
// }
