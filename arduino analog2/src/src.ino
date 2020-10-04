
#include "adc.h"

// #define DEBUG
void setup() {
  setupADC();
  startADC(2, 1);
  noInterrupts();
  DDRB = 0b00011111;
  DDRD = 0b11100000;
}

void loop() {
  // loop_until_bit_is_set(ADCSRA, ADIF);
  // bitSet(ADCSRA, ADIF);  // this actually clears the bit
  uint8_t val = ADCH;
  // uint8_t valD = val & 0b11100000;
  // uint8_t valB = val & 0b00011111;
  // PORTD = valD;
  // PORTB = valB;
  PORTD = val;
  PORTB = val;
}
