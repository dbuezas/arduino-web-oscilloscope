#include <elapsedMillis.h>

#include "dac_constants.h"
#include "dac_setup.h"
#ifdef DEBUG
#include "mystream.h"
#endif

int8_t Buffer[SAMPLES];

int16_t ReadPtr, WritePtr;

ISR(ADC_vect) {
  uint8_t val = ADCH;
  WritePtr++;
  if (WritePtr == SAMPLES) {
    WritePtr = 0;
  }
  Buffer[WritePtr] = val;
}

void loop() {
  delay(1000);
  ADCSRA = 0;  // stop
  Serial << "measure:"
         << "\n";
  int i = WritePtr + 1;
  while (i != WritePtr) {
    if (i == SAMPLES) i = 0;
    Serial << Buffer[WritePtr] << "\n";
    i++;
  }
  setup();  // start again
}
