
#include "adc.h"
void setup() {
  setupADC();
  startADC();
}

void loop() {
  noInterrupts();
  uint8_t val = ADCH;
  PORTB = val & 0b00011111;
  PORTD = val & 0b11100000;
}
