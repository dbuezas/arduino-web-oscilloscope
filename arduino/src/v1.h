#include <elapsedMillis.h>

#include "dac_constants.h"
#include "mystream.h"

#define SAMPLES 800
#define SERIAL_SAMPLES 500
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
#define INIT_SPEED 1

// register flags
#define DAPEN 7
#define GA0 5
#define DNS0 2
#define DPS0 0
#define DIFFS 1

void setSpeed(int prescaler) {  // 1 to 7

  ADCSRA = 1 << ADEN |   // enable ADC
           1 << ADSC |   // start conversion
           1 << ADATE |  // ADC auto triggering enable
           1 << ADIE |   // enable ADC interrupt
           prescaler << ADPS0;
}

void start() {
  // analogReference(INTERNAL1V024);  // 4v
  bitSet(DIDR0, ADC0D);  // disable digital input (reduce noise)

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

  ADCSRC = 1 << DIFFS |    // from diff amplifier
           0 << SPD;       // 1: high speed conversion (can't hear a difference)
  DAPCR = 0b1 << DAPEN |   // Enable
          0b00 << GA0 |    // gain
          0b110 << DNS0 |  // (-) GND
          0b01 << DPS0;    // (+) ADC0

  setSpeed(3);

  interrupts();
}
void setup() {
  Serial.begin(230400);
  Serial.setTimeout(50);
  pinMode(D2, INPUT);
  pinMode(D3, INPUT);
  pinMode(D4, INPUT);
  pinMode(D5, INPUT);
  pinMode(D6, INPUT);
  pinMode(D7, INPUT);
  start();  // start again
}

uint8_t Buffer[SAMPLES];
uint8_t BufferBinary[SAMPLES];

int16_t ReadPtr, WritePtr;
float triggerVoltage = 1.5;
uint16_t triggerVoltageInt = triggerVoltage / 5 * 256;
const float v_int_to_float = 5.0 / 256;
int16_t triggerPtr;
int16_t triggerPos = SERIAL_SAMPLES * 1 / 3;
bool canStop = false;
volatile bool stop = true;
int16_t stopPtr = -1;

ISR(ADC_vect) {
  if (stop) return;
  if (WritePtr == triggerPos) canStop = true;
  uint8_t val = ADCH;
  if (val == 0) val = 1;
  if (triggerPtr < 0 && canStop) {
    bool isAbove = val > triggerVoltageInt;
    static bool wasBelow = false;
    if (wasBelow && isAbove) {
      triggerPtr = WritePtr;
      stopPtr = triggerPtr - triggerPos;
      if (stopPtr < 0) stopPtr += SAMPLES;
      wasBelow = false;
    }
    wasBelow = !isAbove;
  }
  WritePtr++;
  if (WritePtr == SAMPLES) {
    WritePtr = 0;
  }
  Buffer[WritePtr] = val;
  BufferBinary[WritePtr] = PIND;
  if (WritePtr == stopPtr) {
    stop = true;
    bitClear(ADCSRA, ADIE);
  };
}

void handleInput() {
  if (Serial.available() == 0) return;
  triggerVoltage = Serial.parseFloat();
  while (Serial.available() > 0) Serial.read();
  triggerVoltageInt = triggerVoltage / 5 * 256;
}

void loop() {
  handleInput();
  canStop = false;
  WritePtr = 0;
  triggerPtr = -1;
  stopPtr = -1;
  stop = false;
  bitSet(ADCSRA, ADIE);
  // delay(500);
  while (!stop) {
  }
  bitClear(ADCSRA, ADIE);
  // uint8_t minInt = 255;
  // uint8_t maxInt = 0;
  // uint8_t activePins = 0;
  // uint8_t initialStatePins = BufferBinary[0];
  // for (int i = 0; i < SAMPLES; i++) {
  //   activePins |= initialStatePins ^ BufferBinary[i];
  //   minInt = min(minInt, Buffer[i]);
  //   maxInt = max(maxInt, Buffer[i]);
  // }
  // float minV = minInt * v_int_to_float;
  // float maxV = maxInt * v_int_to_float;

  // Serial << "TriggerPos@1/3"
  //        << "\t"
  //        << "triggerV@" << triggerVoltage << "v\t"
  //        << "minV@" << minV << "v\t"
  //        << "maxV@" << maxV << "v\t";
  // for (byte pin = 2; pin < 8; pin++) Serial << "pin@D" << pin << "\t";
  // Serial << "\n";
  for (int i = 1; i < SERIAL_SAMPLES; i++) {
    int idx = triggerPtr - triggerPos + i;
    if (idx >= SAMPLES) idx -= SAMPLES;
    if (idx < 0) idx += SAMPLES;
    Serial.write(Buffer[idx]);
  }
  Serial.write(0);
}
/*
else {
      Serial << triggerVoltage * 10 << "\t" << Buffer[idx] * v_int_to_float * 10
             << "\t";
      for (byte pin = 2; pin < 8; pin++) {
        bool isActive = activePins & (0b1 << pin);
        int pinVal = (BufferBinary[idx] & (0b1 << pin)) ? -1 : -10;
        if (isActive)
          Serial << pinVal;
        else
          Serial << -11;
        Serial << "\t";
      }
      Serial << "\n";
    }
    */