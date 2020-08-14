#ifndef DATA_STRUCT_H
#define DATA_STRUCT_H

#define MAX_SAMPLES 500

enum TriggerMode { autom, normal, single };
enum TriggerDir { rising, falling };

typedef struct {
  uint8_t prelude[4];
  uint8_t triggerVoltageInt;
  uint8_t triggerDir;
  uint16_t clocksPerAdcRead;
  uint16_t triggerPos;
  uint16_t triggerPtr;
  bool didTrigger;
  uint8_t triggerMode;
  uint16_t freeMemoryAvailable;
  bool Buffer1_ON;
  bool Buffer2_ON;
  bool Buffer3_ON;
  uint16_t samples;
} State;

State state = {
    {255, 255, 255, 255},  // uint8_t prelude[4];
    128,                   // uint8_t triggerVoltageInt;
    TriggerDir::falling,   // uint8_t triggerDir;
    79,                    // uint16_t clocksPerAdcRead;
    MAX_SAMPLES * 1 / 3,   // uint16_t triggerPos;
    0,                     // uint16_t triggerPtr
    false,                 // bool didTrigger;
    TriggerMode::autom,    //
    100,                   // uint16_t freeMemoryAvailable;
    1,                     // bool Buffer1_ON;
    0,                     // bool Buffer2_ON;
    1,                     // bool Buffer3_ON;
    MAX_SAMPLES            // uint16_t samples;
};

uint8_t Buffer1[MAX_SAMPLES];
uint8_t Buffer2[MAX_SAMPLES];
uint8_t Buffer3[MAX_SAMPLES];

#endif