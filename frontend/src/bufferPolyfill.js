// src/bufferPolyfill.js
import { Buffer } from "buffer";

// Ensure `Buffer` is globally available
if (!window.Buffer) {
  window.Buffer = Buffer;
}
