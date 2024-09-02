# About

This is a simple app to play around with browser-based communications with microcontrollers. Specifically, it reads and rights values and settings using serial and bluetooth.

One day, I might include databases to test simple logging.

# Communication Expectations

## Serial Communication

The web app will parse lines with '\n'.

### Settings

**Getting**
The request to get the current settings should be `getSettings\n`.

The expected return should be a valid json object with all the settings (but no newlines):

```
currentSettings:{deviceName: {name},readInterval: 200, printNotify: true, printHolds: true, printOther: false, valueMin: 0, valueMax: 180}\n

```
`printOther` refers to all everything that isn't a current reading or hold value, including debugging/warnings/whatever.
`valueMin` and `valueMax` refer to how the raw data is interpolated

**Setting**
Requests to change the settings should have the form:

```
set {setting}: {newValue}\n

i.e.
set printNotify: true\n
set printHolds: false\n
set readInterval: 3\n
set valueMin: -180\n
set valueMax: 180\n
```

The device should respond similarly, with an integer success code:

```
set {setting}: {code}\n

i.e.
set showRead: 1\n       // success
set showHold: 0\n       // non-specific failure
set readInterval: 2\n   // failed: value out of bounds
```

If 0 is returned, the app will re-attempt up to 3 times before abandoning the setting update.

### Recieved Values

This app expects the device to send data in the form `valueType: {value}\n`

the value type can be `value` or `hold`

Any other recieve type can still be printed by the app, but if this app is extended to include databases, they will be ignored. This should allow the reader to act as a serial console, as well as a value log.
