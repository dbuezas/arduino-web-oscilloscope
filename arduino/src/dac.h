
ISR(TIMER2_COMPA_vect) {
  DALR = (DALR + 1);
  if (DALR == 230) DALR = 0;
}
void setupDAC() {
  pinMode(DAC0, ANALOG);
  DACON = (1 << DACEN |     // enable dac
           1 << DAOE |      // enable output to D4
           0b00 << DAVS0);  // 00: voltage source is system working power VCC
                            // 01: voltage source is external input AVREF
                            // 10: voltage source is internal reference voltage
                            // (IVSEL0) 11: shut down DAC reference source and
                            // DAC at the sametime

  TCCR2A = 0;
  TCCR2B = 0;
  TCNT2 = 0;  // counter = 0
  OCR2A = 255;
  TCCR2A |= (1 << WGM21);
  TCCR2B |= (1 << CS20);
  TIMSK2 |= (1 << OCIE2A);
}
