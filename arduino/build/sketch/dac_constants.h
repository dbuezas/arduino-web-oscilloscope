#ifndef DAC_CONSTANTS
#define DAC_CONSTANTS

/*
    0 -> 2   -> 727.28 kHz
    1 -> 2   -> 727.28 kHz // adc gives nonsense here
    2 -> 4   -> 363.64 kHz
    3 -> 8   -> 181.82 kHz
    4 -> 16  -> 90.91  kHz
    5 -> 32  -> 45.455 KHz
    6 -> 64  -> 22.727 kHz
    7 -> 128 -> 11,363 kHz
*/

// register flags
#define DAPEN 7
#define GA0 5
#define DNS0 2
#define DPS0 0
#define DIFFS 1

#endif