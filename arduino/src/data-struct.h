#ifndef DATA_STRUCT_H
#define DATA_STRUCT_H

#define MAX_SAMPLES 500

enum TriggerMode { autom, normal, single };
enum TriggerDir { rising, falling };

uint8_t prelude[4] = {0, 1, 255, 253};
typedef struct {
  uint8_t triggerVoltage;
  uint8_t triggerDir;
  uint16_t ticksPerAdcRead;
  uint16_t triggerPos;
  uint16_t bufferStartPtr;
  bool didTrigger;
  uint8_t triggerMode;
  uint8_t triggerChannel;
  uint16_t freeMemory;
  bool isbuffer0ON;
  bool isbuffer1ON;
  bool isbuffer2ON;
  uint16_t samplesPerBuffer;
} State;

State state = {
    // TODO: find a better way to find data
    128,                  // uint8_t triggerVoltage;
    TriggerDir::falling,  // uint8_t triggerDir;
    79,                   // uint16_t ticksPerAdcRead;
    MAX_SAMPLES * 1 / 3,  // uint16_t triggerPos;
    0,                    // uint16_t bufferStartPtr;
    false,                // bool didTrigger;
    TriggerMode::autom,   // uint8_t triggerMode
    0,                    // uint8_t triggerChannel
    100,                  // uint16_t freeMemory;
    1,                    // bool isbuffer0ON;
    0,                    // bool isbuffer1ON;
    1,                    // bool isbuffer2ON;
    MAX_SAMPLES           // uint16_t samplesPerBuffer;
};

uint8_t buffer0[MAX_SAMPLES];
uint8_t buffer1[MAX_SAMPLES];
uint8_t buffer2[MAX_SAMPLES];

#endif