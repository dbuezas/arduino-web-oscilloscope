
#include "adc.h"
void setup() {
  setupADC();
  startADC();
  noInterrupts();
}

void loop() {
  while (1) {
    uint8_t val = ADCH;
    PORTB = val & 0b00011111;
    PORTD = val & 0b11100000;
    // PORTB = val;
    // PORTD = val;
  }
}
