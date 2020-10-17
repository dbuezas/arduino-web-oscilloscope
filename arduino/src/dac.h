#include "data-struct.h"

ISR(TIMER2_COMPA_vect) {
  DALR = (DALR + 1);
  // if (DALR == 230) DALR = 0;
}
const float vArray[] = {
    25,      6.25,  5,        3.125,  1.5625,    0.78125,
    0.78125, 0.625, 0.390625, 0.3125, 0.1953125, 0.15625,
};
void setDAC() {
  return;
  float r = (255.0 / 5.0 * vArray[state.amplifier] * 1 / 2);
  r = constrain(r, 0, 255);
  DALR = (byte)r;
}

void setupDAC() {
  return;
  DACON = (1 << DACEN |     // enable dac
           1 << DAOE |      // enable output to D4
           0b00 << DAVS0);  // 00: voltage source is system working power VCC
                            // 01: voltage source is external input AVREF
                            // 10: voltage source is internal reference voltage
                            // 11: shut down DAC reference source and
                            // DAC at the sametime
  // return;
  TCCR2A = 0;
  TCCR2B = 0;
  TCNT2 = 0;    // counter = 0
  OCR2A = 255;  // TC2 output compare register A
  TCCR2A |= (1 << WGM21);
  /* CS20;
  0: stop
  1: 1
  2: 8
  3: 32
  4: 64
  5: 128
  6: 256
  7: 1024
  */
  TCCR2B |= 1 << CS20;
  bitSet(TIMSK2, OCIE2A);
}
