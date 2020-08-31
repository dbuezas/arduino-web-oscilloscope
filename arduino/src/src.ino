#include "MemoryFree.h"
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
  Serial.begin(115200 * 1);
  // disable all timer interrupts (millis() gone)
  bitWrite(TIMSK0, TOIE0, 0);
  bitWrite(TIMSK1, TOIE1, 0);
  bitWrite(TIMSK2, TOIE2, 0);
  bitWrite(TIMSK3, TOIE3, 0);

  setupADC();
  setupDAC();
}

jmp_buf env;
volatile bool canStop;
void loop() {
  state.freeMemory = freeMemory();
  state.forceUIUpdate = true;
  sendData(false);
  state.forceUIUpdate = true;
  sendData(false);
  for (;;) {
    bool isJump = setjmp(env);
    if (isJump) offAutoInterrupt();
    canStop = false;
    bool change = handleInput();
    if (change) {
      // sendData(false);
    }
    canStop = true;
    fillBuffer();
    digitalWrite(D13, 1);
    canStop = false;
    sendData();
    digitalWrite(D13, 0);
  }
}

volatile byte receives;
ISR(USART_RX_vect) {
  Serial._rx_complete_irq();
  if (canStop) {
    longjmp(env, 1);
  }
}

/*
/Applications/Arduino.app/Contents/Java/hardware/tools/avr/avr/bin/objdump -S \
src.ino.elf > assembler.asm
*/