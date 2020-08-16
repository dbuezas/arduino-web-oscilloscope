#include "adc.h"
#include "dac.h"
#include "data-struct.h"
#include "fillBuffer.h"
#include "input.h"
#include "output.h"

void setup() {
  pinMode(D13, OUTPUT);
  Serial.begin(115200 * 2);
  Serial.setTimeout(100);  // TODO: remove?

  setupADC();
  setupDAC();
}

void loop() {
  handleInput();
  fillBuffer();
  digitalWrite(D13, 1);
  sendBuffer();
  digitalWrite(D13, 0);
}

/*
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/avr/bin/objdump -S \
src.ino.elf > assembler.asm
*/