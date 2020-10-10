SoftwareSerial mySerial(3, 2);

void saveInput(char option, float val) {
  switch (option) {
    case 'A':
      int amplifier = constrain(val, 0, 11);
      startADC(2, amplifier);
      break;
  }
}

/*
  It is a pitty that I need to have my own buffer on top of the circular buffer
  that HardwareSerial has. This is because there is no method to read that
  buffer without consuming it.
*/
#define INPUT_BUFFER_SIZE 35
char inputBuffer[INPUT_BUFFER_SIZE];
byte ptr = 0;
bool handleInput() {
  bool wait = false;
  while (mySerial.available()) {
    int s = mySerial.read();
    if (s == '>') {
      char option = inputBuffer[0];
      float val = atof(inputBuffer + 1);
      ptr = 0;
      inputBuffer[ptr] = 0;

      saveInput(option, val);
      wait = false;
    } else {
      if (ptr >= INPUT_BUFFER_SIZE - 1) {
        // don't write outside the array
        // this is actually an exception.
        ptr = 0;
      }
      inputBuffer[ptr] = (char)s;
      ptr++;
      inputBuffer[ptr] = 0;
      // delayMicroseconds(100);
      // give time to receive the rest of the message before filling the buffer
      // with trash. Not using normal delay because it uses micros() and that
      // timer is off
      wait = true;
    }
  }
  return wait;
}
