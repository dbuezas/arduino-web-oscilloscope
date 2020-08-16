
#define DAPEN 7
#define GA0 5
#define DNS0 2
#define DPS0 0
#define DIFFS 1

/*
    0 -> 2   -> 727.28 kHz
    1 -> 2   -> 727.28 kHz // adc can't read over 2.5v here
    2 -> 4   -> 363.64 kHz
    3 -> 8   -> 181.82 kHz
    4 -> 16  -> 90.91  kHz
    5 -> 32  -> 45.455 KHz
    6 -> 64  -> 22.727 kHz
    7 -> 128 -> 11,363 kHz
*/
#define ADC_PRESCALER_conf 2  // 1 to 7
// #define ADC_PRESCALER (1 << ADC_PRESCALER_conf)
// uint16_t ticksPerAdcRead =
//     ADC_PRESCALER * (15 + 1.5 + 5.5) -
//     9;  // A normal conversion takes 15 ADC clock cycles
//         // + 1.5 sample and hold + (5.5 unaccounted for) -9 for timing
//         overhead

inline void startADC() {
  ADCSRA = 1 << ADEN |   // enable ADC
           1 << ADSC |   // start conversion
           1 << ADATE |  // ADC auto triggering enable
           0 << ADIE |   // disable ADC interrupt
           ADC_PRESCALER_conf << ADPS0;
}
inline void stopADC() { ADCSRA = 0; }

void setupADC() {
  // counter for adcREad
  TCCR1A = 0;
  TCCR1B = (1 << CS00);  // normal, top is 0xFFFF, no prescaler
  // counter is TCNT1 andit counts cpu clocks

  // analogReference(INTERNAL1V024);  // 4v
  bitSet(DIDR0, ADC0D);  // disable digital input (reduce noise)
  // disable all timer interrupts (millis() gone)
  // TIMSK0 = 0;
  // TIMSK1 = 0;
  // TIMSK2 = 0;
  // TIMSK3 = 0;
  TIMSK0 &= ~_BV(TOIE0);
  TIMSK1 &= ~_BV(TOIE1);
  TIMSK2 &= ~_BV(TOIE2);
  TIMSK3 &= ~_BV(TOIE3);

  noInterrupts();

  pinMode(A0, INPUT);
  ADMUX = 0b01 << REFS0 |  // ADC refference is AVCC [seel also: ADCSRD:REFS2]
          1 << ADLAR |     // ADC data register is left adjustment
          0b0000 << MUX0;  // ADC0 (but multiplexer is not used now, i go for
                           // diff amplifier)

  ADCSRD = 0b0 << REFS2 |    // part of ADC reference voltage [see ADMUX:REFS0]
           0b00 << IVSEL0 |  // 2v DAC output
           0b000 << VDS0;    // shut down voltage division

  ADCSRB = 0 << ADTS0;  // Continuous conversion

  ADCSRC = 1 << DIFFS |   // from diff amplifier
           0 << SPD;      // 1: high speed conversion (can't hear a difference)
  DAPCR = 0b1 << DAPEN |  // Enable
          0b00 << GA0 |   // gain
                          // 0b000 << DNS0 |  // (-) ADC2

          // 0b101 << DNS0 |  // (-) ADC0
          // 0b11 << DPS0;    // (+) GND

          0b110 << DNS0 |  // (-) GND
          0b00 << DPS0;    // (+) ADC0 through mux

  pinMode(D2, INPUT);
  pinMode(D3, INPUT);
  // pinMode(D4, INPUT); // this is the dac output
  pinMode(D5, INPUT);
  pinMode(D6, INPUT);
  pinMode(D7, INPUT);

  interrupts();
}
