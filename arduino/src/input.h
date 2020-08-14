#include "data-struct.h"

void handleInput() {
  while (Serial.available() > 2) {
    char option = Serial.read();
    String value = Serial.readStringUntil('>');
    if (value.length() == 0) return;
    int val = value.toInt();
    if (option == 'C') {  // CLOCK TICKS
      state.clocksPerAdcRead = val;
    }
    if (option == 'V') {  // triggerVoltage
      state.triggerVoltageInt = constrain(val, 0, 255);
    }
    if (option == 'P') {  // triggerPos
      state.triggerPos = constrain(val, 1, state.samples);
    }
    if (option == 'S') {  // samples
      state.samples = constrain(val, 1, MAX_SAMPLES);
      state.triggerPos = constrain(state.triggerPos, 1, state.samples);
    }
    if (option == 'D') {  // triggerDirection
      val = constrain(val, 0, 1);
      state.triggerDir = val;
    }
    if (option == '1') {
      val = constrain(val, 0, 1);
      state.Buffer1_ON = val;
    }
    if (option == '2') {
      val = constrain(val, 0, 1);
      state.Buffer2_ON = val;
    }
    if (option == '3') {
      val = constrain(val, 0, 1);
      state.Buffer3_ON = val;
    }
    if (option == 'M') {  // MODE
      val = constrain(val, 0, 2);
      state.triggerMode = val;
      // AUTO, TRIGGER, SLOW
    }
  }
}

void send_uint8(uint8_t v) { Serial.write(v); }
void send_int16(int16_t v) {
  Serial.write(lowByte(v));
  Serial.write(highByte(v));
}
void send_uint16(uint16_t v) {
  Serial.write(lowByte(v));
  Serial.write(highByte(v));
}
