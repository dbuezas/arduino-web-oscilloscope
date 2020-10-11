#ifndef DATA_STRUCT_H
#define DATA_STRUCT_H

#define MAX_SAMPLES 512

enum TriggerMode { autom = 0, normal = 1, single = 2, slow = 3 };
enum TriggerDir { rising = 0, falling = 1 };

typedef struct {
  bool inputChanged;
  uint16_t bufferStartPtr;
} InternalState;
InternalState internalState = {
    false,  // bool inputChanged;
    0       // uint16_t bufferStartPtr;
};

uint8_t endOfMessage[4] = {0, 1, 255, 253};
typedef struct {
  // input
  uint8_t triggerVoltage;
  uint8_t triggerDir;
  float secPerSample;
  uint16_t triggerPos;
  uint8_t amplifier;
  uint8_t triggerMode;
  uint8_t triggerChannel;
  uint8_t isChannelOn;
  // input & output
  // output
  bool needData;
  bool forceUIUpdate;
  bool didTrigger;
  uint16_t freeMemory;
  uint16_t sentSamples;
  uint16_t samplesPerBuffer;
} State;

State state = {
    // input
    128,                  // uint8_t triggerVoltage;
    TriggerDir::falling,  // uint8_t triggerDir;
    0.00000275,           // float secPerSample;
    MAX_SAMPLES * 0 / 3,  // uint16_t triggerPos;
    2,                    // uint8_t amplifier;
    TriggerMode::autom,   // uint8_t triggerMode
    0,                    // uint8_t triggerChannel
    0b00100111,           // bool isChannelOn;
    // input & output
    // output
    1,           // bool needData;
    0,           // bool forceUIUpdate;
    false,       // bool didTrigger;
    100,         // uint16_t freeMemory;
    0,           // uint16_t sentSamples;
    MAX_SAMPLES  // uint16_t samplesPerBuffer;
};

uint8_t buffer0[MAX_SAMPLES];
uint8_t buffer1[MAX_SAMPLES];
uint8_t buffer2[MAX_SAMPLES];

#endif