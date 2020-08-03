#include "MemoryFree.h"
#include "dac_constants.h"
#include "mystream.h"

#define SERIAL_SAMPLES 500
#define SAMPLES SERIAL_SAMPLES  // 800
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
#define ADC_PRESCALER (1 << ADC_PRESCALER_conf)
uint16_t ADC_MAIN_CLOCK_TICKS =
    ADC_PRESCALER * (15 + 1.5 + 5.5) -
    9;  // A normal conversion takes 15 ADC clock cycles
        // + 1.5 sample and hold + (5.5 unaccounted for) -9 for timing overhead
// prescaler = 2 --> 79
// prescaler = 3 --> 167
// prescaler = 4 --> 343
// PRE TRIGGER = 33 clocks min
// Trigger takes 38

// register flags
#define DAPEN 7
#define GA0 5
#define DNS0 2
#define DPS0 0
#define DIFFS 1

inline void startADC() {
  ADCSRA = 1 << ADEN |   // enable ADC
           1 << ADSC |   // start conversion
           1 << ADATE |  // ADC auto triggering enable
           0 << ADIE |   // disable ADC interrupt
           ADC_PRESCALER_conf << ADPS0;
}
inline void stopADC() { ADCSRA = 0; }

void start() {
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

  interrupts();
}
void setup() {
  pinMode(D13, OUTPUT);
  pinMode(DAC0, ANALOG);
  DACON = (1 << DACEN |     // enable dac
           1 << DAOE |      // enable output to D4
           0b00 << DAVS0);  // 00: voltage source is system working power VCC
                            // 01: voltage source is external input AVREF
                            // 10: voltage source is internal reference voltage
                            // (IVSEL0) 11: shut down DAC reference source and
                            // DAC at the sametime
  Serial.begin(115200 * 2);
  Serial.setTimeout(100);
  pinMode(D2, INPUT);
  pinMode(D3, INPUT);
  // pinMode(D4, INPUT);
  pinMode(D5, INPUT);
  pinMode(D6, INPUT);
  pinMode(D7, INPUT);

  TCCR1A = 0;
  TCCR1B = (1 << CS00);  // normal, top is 0xFFFF, no prescaler
  // counter is TCNT1 andit counts cpu clocks

  start();
}

uint8_t Buffer[SAMPLES];
uint8_t BufferBinary[SAMPLES];

bool blockInterrupts = false;

float triggerVoltage = 1.5;
uint8_t triggerVoltageInt = triggerVoltage / 5 * 256;
int16_t triggerPtr;
int16_t triggerPos = SERIAL_SAMPLES * 1 / 3;

#define RISING_EDGE 1
#define FALLING_EDGE 0

bool triggerDir = FALLING_EDGE;
/*
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/avr/bin/objdump -S \
dac.ino.elf > assembler.txt
*/
uint16_t WritePtr = 0;
uint8_t val;
uint16_t limit;
__attribute__((always_inline)) inline void storeOne() {
  while (TCNT1 < ADC_MAIN_CLOCK_TICKS) {
    DAL0++;
  };
  val = ADCH;
  TCNT1 -= ADC_MAIN_CLOCK_TICKS;
  Buffer[WritePtr] = val;
  WritePtr++;
  if (WritePtr == SAMPLES) WritePtr = 0;
  BufferBinary[WritePtr] = PIND;  // the ADC reading is 1 iterations delayied
  limit--;
}
void readBuffer() {
  // fill until triggerPos
  limit = SAMPLES * 10;
  uint8_t triggerVoltageIntMinus = max(0, (int)triggerVoltageInt - 2);
  uint8_t triggerVoltageIntPlus = min(255, (int)triggerVoltageInt + 2);
  if (blockInterrupts) noInterrupts();

  startADC();
  TCNT1 = 0;
  for (int16_t i = 0; i < triggerPos && limit > 0; i++) {
    storeOne();
  }
  if (triggerDir == FALLING_EDGE) {
    while (val < triggerVoltageIntPlus && limit > 0) {
      storeOne();
    }
    while (val > triggerVoltageInt && limit > 0) {
      storeOne();
    }
  }
  if (triggerDir == RISING_EDGE) {
    while (val > triggerVoltageIntMinus && limit > 0) {
      storeOne();
    }
    while (val < triggerVoltageInt && limit > 0) {
      storeOne();
    }
  }
  if (limit == 0)
    triggerPtr = 0;
  else
    triggerPtr = WritePtr;
  // trigger point found
  int16_t stopPtr = triggerPtr - triggerPos - 1;
  if (stopPtr < 0) stopPtr += SAMPLES;
  // fill buffer
  while (WritePtr != stopPtr) {
    storeOne();
  }
  stopADC();
  if (blockInterrupts) interrupts();
}

String serialBuffer;
void handleInput() {
  while (Serial.available() > 2) {
    char option = Serial.read();
    String value = Serial.readStringUntil('>');
    if (value.length() == 0) return;
    int val = value.toInt();
    if (option == 'C') {  // CLOCK TICKS
      ADC_MAIN_CLOCK_TICKS = val;
    }
    if (option == 'V') {  // triggerVoltage
      triggerVoltageInt = constrain(val, 0, 255);
    }
    if (option == 'P') {  // triggerPos
      triggerPos = constrain(val, 1, SAMPLES);
    }
    if (option == 'D') {  // triggerDirection
      val = constrain(val, 0, 1);
      triggerDir = val;
    }
    if (option == 'I') {  // triggerDirection
      val = constrain(val, 0, 1);
      blockInterrupts = val;
    }
    if (option == 'M') {  // MODE
      // mode = val
      // AUTO, TRIGGER, SLOW
    }
  }
}

void send_uint8(uint8_t v) { Serial.write(v); }
void send_int16(int16_t v) {
  Serial.write(lowByte(v));
  Serial.write(highByte(v));
}
void send_uint16(uint16_t v) {
  Serial.write(lowByte(v));
  Serial.write(highByte(v));
}
// 44,244 =300
void loop() {
  handleInput();
  readBuffer();
  digitalWrite(D13, 1);
  send_uint8(255);
  send_uint8(255);
  send_uint8(255);
  send_uint8(255);
  send_uint8(triggerVoltageInt);
  send_uint8(triggerDir);
  send_uint16(ADC_MAIN_CLOCK_TICKS);
  send_int16(triggerPos);
  send_int16(freeMemory());
  send_uint16(SERIAL_SAMPLES);
  digitalWrite(D13, 0);
  for (int i = 0; i < SERIAL_SAMPLES; i++) {
    int idx = triggerPtr - triggerPos + i;
    if (idx >= SAMPLES) idx -= SAMPLES;
    if (idx < 0) idx += SAMPLES;
    if (Buffer[idx] == 255)
      Serial.write(254);
    else
      Serial.write(Buffer[idx]);
  }
  for (int i = 0; i < SERIAL_SAMPLES; i++) {
    int idx = triggerPtr - triggerPos + i;
    if (idx >= SAMPLES) idx -= SAMPLES;
    if (idx < 0) idx += SAMPLES;
    if (BufferBinary[idx] == 255)
      Serial.write(254);
    else
      Serial.write(BufferBinary[idx]);
  }
  Serial.flush();  // avoid interrupts while reading
}
