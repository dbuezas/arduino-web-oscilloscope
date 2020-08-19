
/*
#pragma push_macro("USART_RX_vect")
#define USART_RX_vect _VECTOR(0)  // unused vector 0
#include <HardwareSerial0.cpp>
#pragma pop_macro("USART_RX_vect")

#include <setjmp.h>

void fn() {
  if (setjmp(env)) {
    // receive serial
  }
  while (1) {
    longjmp(env, 1);
  }
}

volatile byte receives;
ISR(USART_RX_vect) {
  Serial._rx_complete_irq();
  // receives++;
  // longjmp(env, 1);
}
*/