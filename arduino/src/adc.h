
#define DAPEN 7
#define GA0 5
#define DNS0 2
#define DPS0 0
#define DIFFS 1

/*
    0 -> 2   -> 727.28 kSamples
    1 -> 2   -> 727.28 kSamples // adc can't read over 2.5v here
    2 -> 4   -> 363.64 kSamples
    3 -> 8   -> 181.82 kSamples
    4 -> 16  -> 90.91  kSamples
    5 -> 32  -> 45.455 KSamples
    6 -> 64  -> 22.727 kSamples
    7 -> 128 -> 11,363 kSamples
*/
#define ADC_PRESCALER_conf 2  // 1 to 7
// #define ADC_PRESCALER (1 << ADC_PRESCALER_conf)
// uint16_t ticksPerAdcRead =
//     ADC_PRESCALER * (15 + 1.5 + 5.5) -
//     9;  // A normal conversion takes 15 ADC clock cycles
//         // + 1.5 sample and hold + (5.5 unaccounted for) -9 for timing
//         overhead

#define DIV_1 0b0000
#define DIV_1_5 0b1000
#define DIV_4_5 0b1110
#define GAIN1 0b00
#define GAIN8 0b01
#define GAIN16 0b10
#define GAIN32 0b11
const uint8_t gainArray[][2] = {
    {GAIN1, DIV_1_5},  {GAIN1, DIV_4_5},  {GAIN1, DIV_1},    {GAIN8, DIV_1_5},
    {GAIN16, DIV_1_5}, {GAIN32, DIV_1_5}, {GAIN8, DIV_4_5},  {GAIN8, DIV_1},
    {GAIN16, DIV_4_5}, {GAIN16, DIV_1},   {GAIN32, DIV_4_5}, {GAIN32, DIV_1},
};
inline void startADC(uint8_t prescaler, uint8_t amplifier) {
  // ADC0 --->
  // -[ADCSRD]-> voltage division ->
  // -[ADMUX]-> muxer ->
  // -[DAPCR]-> diff amplifier ->
  // -[ADCSRD]-> ADC ->

  // 2, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625

  uint8_t gain = gainArray[amplifier][0];
  uint8_t divisor = gainArray[amplifier][1];

  ADMUX = 1 << REFS0 |  // ADC refference is AVCC [seel also: ADCSRD:REFS2]
          0 << REFS1 |  // ADC refference is AVCC [seel also: ADCSRD:REFS2]
          1 << ADLAR |  // ADC data register is left adjustment
          divisor << MUX0;
  // 0b0000 << MUX0;  // ADC0
  // 0b1000 << MUX0;  // 1/5 ADC0
  // 0b1110 << MUX0;  // 4/5 ADC0

  ADCSRA = 1 << ADEN |   // enable ADC
           1 << ADSC |   // start conversion
           1 << ADATE |  // ADC auto triggering enable
           0 << ADIE |   // disable ADC interrupt
           prescaler << ADPS0;
  ADCSRB = 0 << ADTS0;  // Continuous conversion

  ADCSRC = 1 << DIFFS |  // 1 = from diff amplifier, 0=multiplexer
           0 << SPN |    // ADC conversion input polarity control
           0 << SPD;     // 1: high speed conversion (can't hear a difference)
  ADCSRD = 0 << REFS2 |  // part of ADC reference voltage [see ADMUX:REFS0]
           0b00 << IVSEL0 |  // 2v DAC output
           0b001 << VDS0;    // ADC0 voltage division
  DAPCR = 0b1 << DAPEN |     // Enable
                             // 0b00 << GA0 |      // gain
          gain << GA0 |      // gain
          0b110 << DNS0 |    // (-) GND
          0b00 << DPS0;      // (+) MUX
}

inline void stopADC() { ADCSRA = 0; }

void setupADC() {
  bitSet(DIDR0, ADC0D);  // disable digital input (reduce noise)
  pinMode(A0, INPUT);

  // PB0::4 // part 2 of external ADC
  pinMode(D8, INPUT);
  pinMode(D9, INPUT);
  pinMode(D10, INPUT);
  pinMode(D11, INPUT);
  pinMode(D12, INPUT);
  // PD5::7 // part 1 of external ADC
  pinMode(D5, INPUT);
  pinMode(D6, INPUT);
  pinMode(D7, INPUT);
  // PC2::5 // 4 digital channels
  pinMode(A2, INPUT);
  pinMode(A3, INPUT);
  pinMode(A4, INPUT);
  pinMode(A5, INPUT);
}
