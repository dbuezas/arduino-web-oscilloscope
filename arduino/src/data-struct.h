#ifndef DATA_STRUCT_H
#define DATA_STRUCT_H

#define MAX_SAMPLES 512

enum TriggerMode { autom, normal, single };
enum TriggerDir { rising, falling };

uint8_t endOfMessage[4] = {0, 1, 255, 253};
typedef struct {
  // input
  uint8_t triggerVoltage;
  uint8_t triggerDir;
  uint16_t ticksPerAdcRead;
  uint16_t triggerPos;
  uint8_t amplifier;
  uint8_t triggerMode;
  uint8_t triggerChannel;
  uint8_t isChannelOn;
  // input & output
  // output
  bool needData;
  bool forceUIUpdate;
  uint16_t bufferStartPtr;
  bool didTrigger;
  uint16_t freeMemory;
  uint16_t trashedSamples;
  uint16_t samplesPerBuffer;
} State;

State state = {
    // input
    128,                  // uint8_t triggerVoltage;
    TriggerDir::falling,  // uint8_t triggerDir;
    79,                   // uint16_t ticksPerAdcRead;
    MAX_SAMPLES * 0 / 3,  // uint16_t triggerPos;
    2,                    // uint8_t amplifier;
    TriggerMode::autom,   // uint8_t triggerMode
    0,                    // uint8_t triggerChannel
    0b00100111,           // bool isChannelOn;
    // input & output
    // output
    1,            // bool needData;
    0,            // bool forceUIUpdate;
    0,            // uint16_t bufferStartPtr;
    false,        // bool didTrigger;
    100,          // uint16_t freeMemory;
    MAX_SAMPLES,  // uint16_t trashedSamples;
    MAX_SAMPLES   // uint16_t samplesPerBuffer;
};

uint8_t buffer0[MAX_SAMPLES];
uint8_t buffer1[MAX_SAMPLES];
uint8_t buffer2[MAX_SAMPLES];

#endif