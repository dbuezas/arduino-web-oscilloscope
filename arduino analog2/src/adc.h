
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

inline void startADC() {
  ADCSRA = 1 << ADEN |   // enable ADC
           1 << ADSC |   // start conversion
           1 << ADATE |  // ADC auto triggering enable
           0 << ADIE |   // disable ADC interrupt
           ADC_PRESCALER_conf << ADPS0;
}
inline void stopADC() { ADCSRA = 0; }

void setupADC() {
  // analogReference(INTERNAL1V024);  // 4v
  bitSet(DIDR0, ADC0D);  // disable digital input (reduce noise)

  pinMode(A0, INPUT);
  ADMUX = 0b01 << REFS0 |  // ADC refference is AVCC [seel also: ADCSRD:REFS2]
          1 << ADLAR |     // ADC data register is left adjustment
                        // ADC0 (but multiplexer is not used now, i go for diff
                        // amplifier)
          0b0000 << MUX0;

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

  // PD5::7 // part 2 of external ADC
  pinMode(D5, OUTPUT);
  pinMode(D6, OUTPUT);
  pinMode(D7, OUTPUT);
  // PB0::4 // part 1 of external ADC
  pinMode(D8, OUTPUT);
  pinMode(D9, OUTPUT);
  pinMode(D10, OUTPUT);
  pinMode(D11, OUTPUT);
  pinMode(D12, OUTPUT);
}
