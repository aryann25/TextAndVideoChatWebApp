window.global = window;

import { Buffer } from "buffer/index.js";   // ⬅ force browser version
window.Buffer = window.Buffer || Buffer;
