#include "SoftwareSerial.h"
#include "adc.h"
#include "input.h"

// #define DEBUG
void setup() {
  setupADC();
  startADC(2, 4);
  // noInterrupts();
  DDRB = 0b00011111;
  DDRD = 0b11100000;
  mySerial.begin(115200);
  TIMSK0 &= ~_BV(TOIE0);  // disable timer0 overflow interrupt
}

void loop() {
  handleInput();
  for (int i = 0; i < 1000; i++) {
    loop_until_bit_is_set(ADCSRA, ADIF);
    bitSet(ADCSRA, ADIF);  // this actually clears the bit

    uint8_t val = ADCH;
    // uint8_t valD = val & 0b11100000;
    // uint8_t valB = val & 0b00011111;
    // PORTD = valD;
    // PORTB = valB;
    PORTD = val;
    PORTB = val;
  }
}
