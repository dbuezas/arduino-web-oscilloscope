#pragma push_macro("USART_RX_vect")
#define USART_RX_vect _VECTOR(0)  // unused vector 0
#include <HardwareSerial0.cpp>
#pragma pop_macro("USART_RX_vect")

#include <setjmp.h>

#include "adc.h"
#include "dac.h"
#include "data-struct.h"
#include "fillBuffer.h"
#include "input.h"
#include "output.h"
void setup() {
  pinMode(D13, OUTPUT);
  Serial.begin(115200 * 2);
  Serial.setTimeout(100);  // TODO: remove?
  setupADC();
  setupDAC();
}

jmp_buf env;
volatile bool canStop;
void loop() {
  for (;;) {
    noInterrupts();
    bool isJump = setjmp(env);
    canStop = false;
    interrupts();
    handleInput();
    if (isJump) {
      digitalWrite(D13, 1);
      sendUIOnly();
      digitalWrite(D13, 0);
    }
    canStop = true;
    fillBuffer();
    digitalWrite(D13, 1);
    canStop = false;
    sendBuffer();
    digitalWrite(D13, 0);
  }
}

volatile byte receives;
ISR(USART_RX_vect) {
  Serial._rx_complete_irq();
  if (canStop) longjmp(env, 1);
}

/*
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/avr/bin/objdump -S \
src.ino.elf > assembler.asm
*/